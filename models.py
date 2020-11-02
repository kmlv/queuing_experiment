from otree.api import (
    models, BaseConstants, BaseSubsession, BasePlayer
)

from django.contrib.contenttypes.models import ContentType
from otree_redwood.models import Event, DecisionGroup
from otree_redwood.models import Group as RedwoodGroup

import csv
import random
import math
import otree.common

doc = """
This is a Lines Queueing project
"""

class Constants(BaseConstants):
    name_in_url = 'queuing_experiment'
    players_per_group = None
    num_rounds = 50
    base_points = 0


def parse_config(config_file):
    with open('queuing_experiment/configs/' + config_file) as f:
        rows = list(csv.DictReader(f))

    rounds = []
    for row in rows:
        rounds.append({
            'round_number': int(row['round_number']),
            'num_period': int(row['num_period']),
            'group_id': int(row['group_id']),
            'duration': int(row['duration']),
            'shuffle_role': True if row['shuffle_role'] == 'TRUE' else False,
            'players_per_group': int(row['players_per_group']),
            'swap_method': str(row['swap_method']),
            'pay_method': str(row['pay_method']),
            'discrete': True if row['discrete'] == 'TRUE' else False,
            'messaging': True if row['messaging'] == 'TRUE' else False,
            'value': int(row['value']),
            'endowment': int(row['endowment']),
            'service_time': int(row['service_time']),
        })
    return rounds

class Subsession(BaseSubsession):
    def num_rounds(self):
        return len(parse_config(self.session.config['config_file']))

    def creating_session(self):
        config = self.config
        if not config:
            return

        num_silos = self.session.config['num_silos']
        fixed_id_in_group = not config['shuffle_role']

        players = self.get_players()
        num_players = len(players)
        silos = [[] for _ in range(num_silos)]
        for i, player in enumerate(players):
            if self.round_number == 1:
                player.silo_num = math.floor(num_silos * i/num_players)
            else:
                player.silo_num = player.in_round(1).silo_num
            silos[player.silo_num].append(player)
        group_matrix = []
        for silo in silos:
            silo_matrix = []
            ppg = self.config['players_per_group']
            for i in range(0, len(silo), ppg):
                silo_matrix.append(silo[i:i+ppg])
            group_matrix.extend(otree.common._group_randomly(silo_matrix, fixed_id_in_group))
        self.set_group_matrix(group_matrix)

    def set_initial_positions(self):
        for g in self.get_groups():
            players = g.get_players()
            positions = [1, 2, 3, 4, 5, 0]
            random.shuffle(positions)
            for i in range(len(positions)):
                players[i]._initial_position = positions[i]
                players[i]._initial_decision = 0
    
    def set_initial_decisions(self):
        for player in self.get_players():
            player._initial_decision = 0
    
    def set_payoffs(self):
        for g in self.get_groups():
            g.set_payoffs()
                
    @property
    def config(self):
        try:
            return parse_config(self.session.config['config_file'])[self.round_number-1]
        except IndexError:
            return None

class Group(RedwoodGroup):

    def round_number(self):
        return parse_config(self.session.config['config_file'])[self.round_number-1]['round_number']

    def num_subperiods(self):
        return parse_config(self.session.config['config_file'])[self.round_number-1]['num_period']

    def period_length(self):
        return parse_config(self.session.config['config_file'])[self.round_number-1]['duration']
    
    def swap_method(self):
        return parse_config(self.session.config['config_file'])[self.round_number-1]['swap_method']
    
    def pay_method(self):
        return parse_config(self.session.config['config_file'])[self.round_number-1]['pay_method']
    
    def value(self):
        return parse_config(self.session.config['config_file'])[self.round_number-1]['value']

    def endowment(self):
        return parse_config(self.session.config['config_file'])[self.round_number-1]['endowment']
    
    def service_time(self):
        return parse_config(self.session.config['config_file'])[self.round_number-1]['service_time']
    
    def messaging(self):
        return parse_config(self.session.config['config_file'])[self.round_number-1]['messaging']
    
    def discrete(self):
        return parse_config(self.session.config['config_file'])[self.round_number-1]['discrete']
    
    # returns a list of the queue where index is position and value is player id
    def queue_list(self):
        queue_list = [0, 0, 0, 0, 0, 0]
        for p in self.get_players():
            queue_list[p._initial_position] =  p.id_in_group
        print("queue_list: ", queue_list)
        return queue_list

    def set_payoffs(self):
        #swap_events = self.get_swap_events()
        #print(swap_events)
        for p in self.get_players():
            p.set_payoff()

    def _on_swap_event(self, event=None, **kwargs):
        type = event.value['type']
        # updates states of all players involved in the most recent event that triggered this
        # method call
        if type == 'request':
            pass
        elif type == 'accept':
            sender = self.get_player_by_id(event.value['sender'])
            receiver = self.get_player_by_id(event.value['receiver'])
            print(self.swap_method())
            if self.swap_method() != 'swap':
                offer = event.value['offer']
                sender.payoff += offer
                receiver.payoff -= offer
            sender._initial_position, receiver._initial_position = receiver._initial_position, sender._initial_position
        elif type == 'cancel':
            pass

        # broadcast the updated data out to all subjects
        self.send('swap', event.value)
        # cache state of queue so that client pages will not reset on reload
        #self.cache = event.value
        # manually save all updated fields to db. otree redwood thing
        self.save()



class Player(BasePlayer):
    silo_num = models.IntegerField()
    _initial_position = models.IntegerField()
    _initial_decision = models.IntegerField()

    def initial_position(self):
        return self._initial_position
    
    def initial_decision(self):
        return self._initial_decision

    def num_players(self):
        return parse_config(self.session.config['config_file'])[self.round_number-1]['players_per_group']

    def set_payoff(self):
        payoffCalc = self.group.endowment()
        final_position = self._initial_position
        payoffCalc += ((6 + 1 - (final_position + 1)) * self.group.value())
        self.payoff += payoffCalc
        print('Final Position of', self.id_in_group, ': ', final_position, ' Service Value: ', ((6 + 1 - (final_position + 1)) * self.group.value()))