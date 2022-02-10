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
from profanity_filter import ProfanityFilter
pf = ProfanityFilter()


doc = """
This is a Lines Queueing project
"""

class Constants(BaseConstants):
    name_in_url = 'queuing_experiment'
    contact_template = 'queuing_experiment/Contactenos.html'
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
            'group_id': int(row['group_id']),
            'duration': int(row['duration']),
            'shuffle_role': True if row['shuffle_role'] == 'TRUE' else False,
            'players_per_group': int(row['players_per_group']),
            'swap_method': str(row['swap_method']),
            'messaging': True if row['messaging'] == 'TRUE' else False,
            'value': str(row['value']),
            'endowment': int(row['endowment']),
            'practice': True if row['practice'] == 'TRUE' else False,
        })
    return rounds

class Subsession(BaseSubsession):
    def num_rounds(self):
        return len(parse_config(self.session.config['config_file']))

    def creating_session(self):
        config = self.config
        if not config:
            return

        #Random rounds picked for payment
        self.session.vars['payment_round1'] = 0
        self.session.vars['payment_round2'] = 0

        while self.session.vars['payment_round1'] == 0:
            rnd = random.randint(1, self.num_rounds())
            if parse_config(self.session.config['config_file'])[rnd-1]['practice']:
                pass
            else:
                self.session.vars['payment_round1'] = rnd
        
        while self.session.vars['payment_round2'] == 0:
            rnd = random.randint(1, self.num_rounds())
            if parse_config(self.session.config['config_file'])[rnd-1]['practice'] or rnd == self.session.vars['payment_round1']:
                pass
            else:
                self.session.vars['payment_round2'] = rnd

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
            positions = [i for i in range(len(players))]
            random.shuffle(positions)
            print("Tokens----------")
            for i in range(len(positions)):
                players[i]._initial_position = positions[i]
                players[i]._final_position = positions[i]
                players[i]._initial_decision = 0
                if players[i].round_number == 1 or players[i].round_number == 3:
                    players[i].tokens = 0
                else:
                    players[i].tokens = players[i].in_round(players[i].round_number - 1).tokens
                print(players[i].tokens)
            print("Tokens----------")

    
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

    def period_length(self):
        return parse_config(self.session.config['config_file'])[self.round_number-1]['duration']
    
    def swap_method(self):
        return parse_config(self.session.config['config_file'])[self.round_number-1]['swap_method']

    def value(self):
        return parse_config(self.session.config['config_file'])[self.round_number-1]['value']
    
    def value_list(self):
        valueList = [int(i) for i in parse_config(self.session.config['config_file'])[self.round_number-1]['value'].strip('][').split(',')]
        print("valueList: ",valueList)
        return valueList

    def endowment(self):
        return parse_config(self.session.config['config_file'])[self.round_number-1]['endowment']
    
    def messaging(self):
        return parse_config(self.session.config['config_file'])[self.round_number-1]['messaging']

    def practice(self):
        return parse_config(self.session.config['config_file'])[self.round_number-1]['practice']
    
    # returns a list of the queue where index is position and value is player id
    def queue_list(self):
        ppg = parse_config(self.session.config['config_file'])[self.round_number-1]['players_per_group']
        queue_list = [0 for i in range(ppg)]
        for p in self.get_players():
            queue_list[p._initial_position] =  p.id_in_group
        print("queue_list: ", queue_list)
        return queue_list

    def set_payoffs(self):
        for p in self.get_players():
            events = list(self.events.filter(channel='swap'))
            p.set_payoff(events)

    def _on_swap_event(self, event=None, **kwargs):
        type = event.value['type']
        # updates states of all players involved in the most recent event that triggered this
        # method call
        print(event.value)
        event.value['channel'] = 'outgoing'
        if type == 'request':
            if 'message' in event.value:
                pf.censor(event.value['message'])
                event.value['message'] = pf.censor(event.value['message'])
        # broadcast the updated data out to all subjects
        self.send('swap', event.value)
        self.save()
    
    def _on_report_event(self, event=None, **kwargs):
        print(event.value['message'])
        self.save()



class Player(BasePlayer):
    silo_num = models.IntegerField()
    _initial_position = models.IntegerField()
    _initial_decision = models.IntegerField()
    _final_position = models.IntegerField()
    final_payoff = models.CurrencyField()
    tokens = models.IntegerField(initial=0)

    def update_token(self, tokens):
        self.tokens = self.tokens + tokens

    def initial_position(self):
        return self._initial_position

    def final_position(self):
        return self._final_position
    
    def initial_decision(self):
        return self._initial_decision

    def num_players(self):
        return parse_config(self.session.config['config_file'])[self.round_number-1]['players_per_group']


    def set_payoff(self,events):
        final_position = self._initial_position
        payoff = self.group.endowment()
        
        for event in events:
            
            if event.value['type'] == 'accept' and event.value['channel'] == 'incoming':
                amount = event.value['offer']
                if self.group.swap_method() == 'Double' and event.value['transfer'] == 0:
                    pass
                else:
                    if self.group.swap_method() == 'Double':
                        amount = event.value['transfer']
                    if self.id_in_group == event.value['senderID']:
                        final_position = event.value['receiverPosition']
                        if self.group.swap_method() != 'swap' and self.group.swap_method() != 'Token':
                            payoff += amount
                        elif self.group.swap_method() == 'Token':
                            self.update_token(amount)
                    elif self.id_in_group == event.value['receiverID']:
                        final_position = event.value['senderPosition']
                        if self.group.swap_method() != 'swap' and self.group.swap_method() != 'Token':
                            payoff -= amount
                        elif self.group.swap_method() == 'Token':
                            self.update_token(-amount)

        val_list = self.group.value_list()
        payoff += ((self.num_players() + 1 - (final_position + 1)) * val_list[self._initial_position])
        self._final_position = final_position
        self.payoff += payoff

        print('Final Position of', self.id_in_group, ': ', final_position, ' Service Value: ', ((self.num_players() + 1 - (final_position + 1)) * self.group.value()))

        #practice round does not count
        if self.group.practice():
            self.participant.payoff -= self.payoff
        
        if self.round_number == self.subsession.num_rounds():
            self.final_payoff = self.in_round(self.session.vars['payment_round1']).payoff + self.in_round(self.session.vars['payment_round2']).payoff
