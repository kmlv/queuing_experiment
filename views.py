from datetime import timedelta
from operator import concat
from functools import reduce

from .models import parse_config

import math
from profanity_filter import ProfanityFilter
pf = ProfanityFilter()

def get_config_columns(group):
    config = parse_config(group.session.config['config_file'])[group.round_number - 1]

    return [
        config['round_number'],
        config['duration'],
        config['shuffle_role'],
        config['players_per_group'],
        config['swap_method'],
        config['messaging'],
        config['value'],
        config['endowment'],
        config['practice'],
    ]

def get_output_table_header(groups):
    #num_silos = groups[0].session.config['num_silos']
    #max_num_players = parse_config(groups[0].session.config['config_file'])[groups[0].round_number - 1]['players_per_group']
    max_num_players = 6

    header = [
        'round_number',
        'duration',
        'shuffle_role',
        'players_per_group',
        'swap_method',
        'messaging',
        'value',
        'endowment',
        'practice'
    ]

    header += [
        'session_code',
        'subsession_id',
        'id_in_subsession',
        'tick',
    ]

    for player_num in range(1, max_num_players + 1):
        header.append('p{}_code'.format(player_num))
        header.append('p{}_ID'.format(player_num))
        header.append('p{}_position'.format(player_num))
        header.append('p{}_value'.format(player_num))

    header += [
        'event_type',
        'sender_code',
        'senderID',
        'sender_position',
        'receiver_code',
        'receiverID',
        'receiver_position',
        'offer',
        'senderTokens', #if accept, it is sender's updated tokens
        'message',
        'request_id',
        'report'
    ]
    
    return header


def get_output_table(events):
    if not events:
        return []
    return get_output_game(events)



# build output for a round of discrete time bimatrix
def get_output_game(events):
    rows = []

    players = events[0].group.get_players()
    group = events[0].group
    max_num_players =  6
    config_columns = get_config_columns(group)

    values = [int(i) for i in parse_config(group.session.config['config_file'])[group.round_number-1]['value'].strip('][').split(',')]
    
    tick = 0

    request_ids = {}
    request_counter = 0

    positions = {p.participant.code: p.initial_position() for p in players}
    reported_messages = []
    for event in events:
        if event.channel == 'report':
            print("Reported: ", event.value['message'])
            reported_messages.append(event.value['message'].strip())

    for event in events:
        if event.channel == 'swap' and event.value['channel'] == 'incoming':
            sender = group.get_player_by_id(event.value['senderID']).participant.code
            receiver = group.get_player_by_id(event.value['receiverID']).participant.code

            #this swaps positions
            if event.value['type'] == 'accept':
                positions[sender] = event.value['receiverPosition']
                positions[receiver] = event.value['senderPosition']

            if event.value['type'] == 'request':
                request_ids[sender] = request_counter
                request_counter += 1

            row = []
            row += config_columns
            row += [
                group.session.code,
                group.subsession_id,
                group.id_in_subsession,
                tick,
            ]
            for player_num in range(max_num_players):
                if player_num >= len(players):
                    row += ['', '', '', '']
                else:
                    pcode = players[player_num].participant.code
                    row += [
                        pcode,
                        players[player_num].id_in_group,
                        positions[pcode],
                        values[group.get_player_by_id(players[player_num].id_in_group).initial_position()]
                    ]
            if event.value['type'] == 'accept':
                print(group.swap_method())
                print(event.value)
                if group.swap_method() == 'Double' and 'transfer' in event.value.keys() and event.value['transfer'] == 0:
                    row += [
                        'reject'
                    ]
                else:
                    row += [
                        event.value['type']
                    ]
            else:
                row += [
                    event.value['type']
                ]
            row += [
                sender,
                event.value['senderID'],
                positions[sender],
                receiver,
                event.value['receiverID'],
                positions[receiver],
                event.value['offer'],
                event.value['currentTokens'],
                
            ]
            if event.value['type'] == 'request':
                row += [
                    event.value['message']
                ]
            else:
                row += [
                    'N/A'
                ]
            
            if event.value['type'] == 'request':
                if sender in request_ids.keys():
                    row += [
                        request_ids[sender]
                    ]
                else:
                    row += [
                        "null"
                    ]
                if pf.censor(event.value['message'].strip()) in reported_messages:
                    print("Connected: ", event.value['message'])
                    row += [
                        1
                    ]
                else:
                    row += [
                        0
                    ]
            elif event.value['type'] == 'accept':
                if receiver in request_ids.keys():
                    row += [
                        request_ids[receiver],
                        0
                    ]
                else:
                    row += [
                        "Null",
                        0
                    ]
            elif event.value['type'] == 'reject':
                if receiver in request_ids.keys():
                    row += [
                        request_ids[receiver],
                        0
                    ]
                else:
                    row += [
                        "null",
                        0
                    ]
            elif event.value['type'] == 'cancel':
                if sender in request_ids.keys():
                    row += [
                        request_ids[sender],
                        0
                    ]
                else:
                    row += [
                        "null",
                        0
                    ]
            rows.append(row)
            tick += 1
    return rows
