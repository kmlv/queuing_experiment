from datetime import timedelta
from operator import concat
from functools import reduce
from .models import parse_config
import math

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
    num_silos = groups[0].session.config['num_silos']
    max_num_players = max(len(g.get_players()) for g in groups)

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

    header += [
        'event_type',
        'sender_code'
        'senderID',
        'sender_position',
        'receiver_code',
        'receiverID',
        'receiver_position',
        'offer',
        'message',
        'request_id',
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
    max_num_players = math.ceil(group.session.num_participants / len(players))
    config_columns = get_config_columns(group)
    
    tick = 0

    request_ids = {}
    request_counter = 0

    positions = {p.participant.code: p.initial_position() for p in players}
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
                    row += ['', '']
                else:
                    pcode = players[player_num].participant.code
                    row += [
                        pcode,
                        players[player_num].id_in_group,
                        positions[pcode],
                    ]
            row += [
                event.value['type'],
                sender,
                event.value['senderID'],
                event.value['senderPosition'],
                receiver,
                event.value['receiverID'],
                event.value['receiverPosition'],
                event.value['offer'],
                
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
                row += [
                    request_ids[sender]
                ]
            elif event.value['type'] == 'accept':
                row += [
                    request_ids[receiver]
                ]
            elif event.value['type'] == 'reject':
                row += [
                    request_ids[receiver]
                ]
            elif event.value['type'] == 'cancel':
                row += [
                    request_ids[sender]
                ]
            rows.append(row)
            tick += 1
    return rows