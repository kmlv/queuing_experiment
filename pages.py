import math
from ._builtin import Page, WaitPage

from datetime import timedelta
from operator import concat
from functools import reduce
from .models import parse_config

class Pagina_inicial(Page):
    def is_displayed(self):
        return self.round_number == 1

class Introduction(Page): 
    def is_displayed(self):
        return self.round_number == 1
    
class StartPaidRound(Page): 
    def is_displayed(self):
        return self.round_number == 3

class Instructions(Page):

    def is_displayed(self):

       
        #try:
        #    swap_method_1=parse_config(self.session.config['config_file'])[self.round_number-1]['swap_method']

        #    swap_method_2= parse_config(self.session.config['config_file'])[self.round_number-2]['swap_method']

        #    return swap_method_1 != swap_method_2 

        #except IndexError:
        #    return None
        
        return self.round_number == 1

    def vars_for_template(self):
        swap_method=self.group.swap_method()
        return dict(swap_method=swap_method,messaging=self.group.messaging())



class DecisionWaitPage(WaitPage):

    body_text = 'Por favor, espere al resto de jugadores.'
    wait_for_all_groups = True
    after_all_players_arrive = 'set_initial_positions'

    def is_displayed(self):
        return self.subsession.config is not None


class Decision(Page):
    def get_timeout_seconds(self):
        return parse_config(self.group.session.config['config_file'])[self.group.round_number - 1]['duration']

    def is_displayed(self):
        return self.subsession.config is not None


class ResultsWaitPage(WaitPage):
    body_text = 'Por favor, espere al resto de jugadores.'

    wait_for_all_groups = True
    after_all_players_arrive = 'set_payoffs'

    def is_displayed(self):
        return self.subsession.config is not None


class Results(Page):

    timeout_seconds = 20

    def is_displayed(self):
        return self.subsession.config is not None

    def vars_for_template(self):
        if not self.group:
            # If issue in group
            return {
                'final_position': 'Error in Group',
                'initial_position': 'Error in Group',
                'transactions': [],
            }
        events = list(self.group.events.filter(channel='swap'))
        transactions = []
        for event in events:
            if event.value['type'] == 'accept' and event.value['channel'] == 'incoming':
                status = 'ACCEPTED'
                transfer = event.value['offer']
                if self.group.swap_method() == 'Double':
                    if event.value['transfer'] == 0:
                        status = 'REJECTED'
                    transfer = event.value['transfer']
                if self.player.id_in_group == event.value['senderID']:
                    transactions.append({
                        'original_position': event.value['senderPosition'] + 1,
                        'new_position': event.value['receiverPosition'] + 1,
                        'status': status,
                        'transfer': transfer,
                    })
                elif self.player.id_in_group == event.value['receiverID']:
                    transactions.append({
                        'original_position': event.value['receiverPosition'] + 1,
                        'new_position': event.value['senderPosition'] + 1,
                        'status': status,
                        'transfer': -1 * transfer,
                    })
            if event.value['type'] == 'reject' and event.value['channel'] == 'incoming':
                if self.player.id_in_group == event.value['senderID']:
                    transactions.append({
                        'original_position': event.value['senderPosition'] + 1,
                        'new_position': event.value['senderPosition'] + 1,
                        'status': "REJECTED",
                        'transfer': 1 * event.value['offer'],
                    })
                elif self.player.id_in_group == event.value['receiverID']:
                    transactions.append({
                        'original_position': event.value['receiverPosition'] + 1,
                        'new_position': event.value['receiverPosition'] + 1,
                        'status': "REJECTED",
                        'transfer': -1 * event.value['offer'],
                    })
            if event.value['type'] == 'cancel' and event.value['channel'] == 'incoming':
                if self.player.id_in_group == event.value['senderID']:
                    transactions.append({
                        'original_position': event.value['senderPosition'] + 1,
                        'new_position': event.value['senderPosition'] + 1,
                        'status': "CANCELLED",
                        'transfer': 1 * event.value['offer'],
                    })
                elif self.player.id_in_group == event.value['receiverID']:
                    transactions.append({
                        'original_position': event.value['receiverPosition'] + 1,
                        'new_position': event.value['receiverPosition'] + 1,
                        'status': "CANCELLED",
                        'transfer': -1 * event.value['offer'],
                    })

        return {
            'final_position': self.player.final_position() + 1,
            'initial_position': self.player.initial_position() + 1,
            'transactions': transactions,
            'transfertext': "Token" if self.group.swap_method() == 'Token' else "Transfer",
        }

class Payment(Page):

    def is_displayed(self):
        return self.round_number == self.subsession.num_rounds()
    
    def vars_for_template(self):
        return {
            'payoff': self.player.in_round(self.session.vars['payment_round1']).payoff + self.player.in_round(self.session.vars['payment_round2']).payoff,
            'payoff_round1': self.session.vars['payment_round1'],
            'payoff_round2': self.session.vars['payment_round2'],
        }

class Pago_final(Page):
    def is_displayed(self):
        return self.round_number == self.subsession.num_rounds()


page_sequence = [Pagina_inicial,
    Introduction,
    StartPaidRound,
    Instructions,
    DecisionWaitPage,
    Decision,
    ResultsWaitPage,
    Results,
    Payment,
    Pago_final
]
