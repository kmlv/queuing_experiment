import {html,PolymerElement} from '/static/otree-redwood/node_modules/@polymer/polymer/polymer-element.js';
import '../polymer-elements/iron-flex-layout-classes.js';
import '../polymer-elements/paper-progress.js';
import '../polymer-elements/paper-radio-button.js';
import '../polymer-elements/paper-radio-group.js';

import '/static/otree-redwood/src/redwood-decision/redwood-decision.js';
import '/static/otree-redwood/src/redwood-period/redwood-period.js';
import '/static/otree-redwood/src/redwood-decision-bot/redwood-decision-bot.js';
import '/static/otree-redwood/src/otree-constants/otree-constants.js';

import '../bimatrix-heatmap/bimatrix-heatmap.js';
import '../heatmap-thermometer/heatmap-thermometer.js';
import '../payoff-graph/payoff-graph.js';
import '../subperiod-payoff-graph/subperiod-payoff-graph.js';
import '../strategy-graph/strategy-graph.js';
import '../subperiod-strategy-graph/subperiod-strategy-graph.js';
import '../styled-range/styled-range.js';
import '../discrete-mean-matching-heatmap/discrete-mean-matching-heatmap.js';

import '../color.js';

export class Queue extends PolymerElement {
    static get template() {
        return html `
            <style include="iron-flex iron-flex-alignment"></style>

            <otree-constants id="constants"></otree-constants>
            <redwood-period
                running="{{ _isPeriodRunning }}"
                on-period-start="_onPeriodStart"
                on-period-end="_onPeriodEnd">
            </redwood-period>
            <redwood-decision
                
            </redwood-decision>

            <div class="layout vertical center">
                <div class="layout align-right">
                    <template is="dom-repeat" index-as="index" items="{{queueList}}" as="queue">
                    </template>
                </div>

                <div class="layout horizontal">
                    <div class="layout vertical">
                        <template is="dom-repeat" index-as="index" items="{{requests}}" as="requests">
                        </template>
                    </div>

                    <div class="layout vertical">
                        <div class="layout vertical">
                            <p>Your Decision</p>
                            <p>Player you want to exchange position:</p>
                            <p>Your offer</p>
                            <button type="button"> Send your request</button>
                        </div>

                        <div class="layout horizontal">
                            <div class="layout vertical">
                                <p>1st in the line:</p>
                                <p>2nd in the line:</p>
                                <p>3rd in the line:</p>
                                <p>4th in the line:</p>
                                <p>5th in the line:</p>
                                <p>6th in the line:</p>
                            </div>
                        

                            <div class="layout vertical">
                                <p>Your current payoff:</p>
                                <p>Round parameter:</p>
                                <p>Exchange rule:</p>
                                <p>Messaging:</p>
                            </div>

                        </div>

                    </div>
                </div>

            </div>
        
        `
    }

    static get properties() {
        return {
        }
    }

    ready() {
        super.ready()
    }

    _onPeriodStart() {
        this._subperiodProgress = 0;
        this.lastT = performance.now();
        this._animID = window.requestAnimationFrame(
            this._updateSubperiodProgress.bind(this));
    }
    _onPeriodEnd() {
        window.cancelAnimationFrame(this._animID);
        this._subperiodProgress = 0;
    }
}

window.customElements.define('queue', Queue);