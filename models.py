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
            'pay_rate': int(row['pay_rate']),
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
            if config['mean_matching']:
                silo_matrix = [ silo ]
            else:
                silo_matrix = []
                ppg = self.config['players_per_group']
                for i in range(0, len(silo), ppg):
                    silo_matrix.append(silo[i:i+ppg])
            group_matrix.extend(otree.common._group_randomly(silo_matrix, fixed_id_in_group))
        self.set_group_matrix(group_matrix)

    def set_initial_positions(self):
        for g in self.get_groups():
        players = g.get_players()
        positions = [1, 2, 3, 4, 5, 6]
        random.shuffle(number_list)
        for i in range(len(positions)):
            players[i]._initial_position = positions[0]
                
    @property
    def config(self):
        try:
            return parse_config(self.session.config['config_file'])[self.round_number-1]
        except IndexError:
            return None

class Group(DecisionGroup):

    def num_subperiods(self):
        return parse_config(self.session.config['config_file'])[self.round_number-1]['num_period']

    def period_length(self):
        return parse_config(self.session.config['config_file'])[self.round_number-1]['duration']
    
    def swap_method(self):
        return parse_config(self.session.config['config_file'])[self.round_number-1]['swap_method']
    
    def pay_method(self):
        return parse_config(self.session.config['config_file'])[self.round_number-1]['pay_method']

    def endowment(self):
        return parse_config(self.session.config['config_file'])[self.round_number-1]['endowment']
    
    def service_time(self):
        return parse_config(self.session.config['config_file'])[self.round_number-1]['service_time']
    
    def messaging(self):
        return parse_config(self.session.config['config_file'])[self.round_number-1]['messaging']
    
    def discrete(self):
        return parse_config(self.session.config['config_file'])[self.round_number-1]['discrete']
    
    
    def set_payoffs(self):
        for p in self.get_players():
            p.set_payoff()

    # takes in the data transferred back and forth by channels,
    # and generates a list representing the queue, where each element in the list
    # IMPORTANT: this list represents the the entire queue, including players in the service room,
    # organized by when they arrived. This means that the 0th element in the returned list is the
    # first person to have entered the service room, and the last element in the list is the person
    # in the back of the queue.
    def queue_state(self, data):
        queue = {}
        for p in self.get_players():
            pp = data[str(p.id_in_group)]
            queue[pp['pos']] = pp['id']
        return [queue.get(k) for k in sorted(queue)]

    def _on_swap_event(self, event=None, **kwargs):
        duration = self.period_length()
        swap_event = event.value['swap_event']
        # updates states of all players involved in the most recent event that triggered this
        # method call
        if swap_event == 'request':
            pass
        elif swap_event == 'response':
            pass
        elif swap_event == 'advance':
            pass

        # broadcast the updated data out to all subjects
        self.send('swap', event.value)
        # cache state of queue so that client pages will not reset on reload
        self.cache = event.value
        # manually save all updated fields to db. otree redwood thing
        self.save()



class Player(BasePlayer):
    _initial_position = models.IntegerField()

    def initial_position(self):
        return self._initial_position

    def set_payoff(self):
        self.payoff = 0
