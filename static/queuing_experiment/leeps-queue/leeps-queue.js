import {html,PolymerElement} from '/static/otree-redwood/node_modules/@polymer/polymer/polymer-element.js';
import '/static/otree-redwood/node_modules/@polymer/polymer/lib/elements/dom-repeat.js';
import '../polymer-elements/iron-flex-layout-classes.js';
import '../polymer-elements/paper-progress.js';
import '../polymer-elements/paper-radio-button.js';
import '../polymer-elements/paper-radio-group.js';

import '/static/otree-redwood/src/redwood-decision/redwood-decision.js';
import '/static/otree-redwood/src/redwood-period/redwood-period.js';
import '/static/otree-redwood/src/redwood-decision-bot/redwood-decision-bot.js';
import '/static/otree-redwood/src/otree-constants/otree-constants.js';

import '../color.js';

export class LeepsQueue extends PolymerElement {
    static get template() {
        return html `
            <style include="iron-flex iron-flex-alignment"></style>
            <style>
                .borders{
                    border-style: solid;
                    padding-top:0px;
                    padding-right:0px;
                    padding-bottom:0px;
                    padding-left:0px;
                    margin-top:0px;
                    margin-right:0px;
                    margin-bottom:0px;
                    margin-left:0px;
                }

                .circle{
                    border-style: solid;
                    border-radius:50%;
                    text-align: center;
                    height: 130px;
                    width: 130px;
                    margin-left:10px;
                    margin-right:10px;
                }

                paper-progress {
                    margin-bottom: 0.625em;
                    --paper-progress-height: 1.875em;
                }
            </style>
            <otree-constants id="constants"></otree-constants>
            <redwood-period
                running="{{ _isPeriodRunning }}"
                on-period-start="_onPeriodStart"
                on-period-end="_onPeriodEnd">
            </redwood-period>
            <!--
            <redwood-decision
                id="channelDecision"
                initial-decision="[[ initialDecision ]]"
                my-decision="{{ _myDecision }}"
                group-decisions="{{ groupDecisions }}"
                on-group-decisions-changed="_onGroupDecisionsChanged"
            >
            </redwood-decision>
            
            
            <redwood-channel
                id="channel"
                channel="group_decisions"
                on-event="_handleGroupDecisionsEvent">
            </redwood-channel>
            -->
            <redwood-channel
                id="channel"
                channel="swap"
                on-event="_handleSwapEvent">
            </redwood-channel>

            <div class="layout horizontal center" style="width: 100%;">
                <div class="borders" style="width: 20%;">
                    Round: 
                </div>
                <div class="borders" style="width: 30%;">
                    Exchange Rule: [[swapMethod]]
                </div>
                <div class="borders" style="width: 30%;">
                    Messaging: [[messaging]]
                </div>
                <div class="borders" style="width: 30%;">
                    Time Remaining: {{}}
                </div>
            </div>

            

            <div class="layout vertical center">
                <div class="layout horizontal borders" style="height: 180px; width: 100%;">
                    <template is="dom-repeat" index-as="index" items="{{_reverse(queueList)}}" as="queueListItems">
                        <div class="layout vertical center">
                            <div class="circle" style="background-color:{{_shadeCircle(queueListItems)}};">
                                <p style="height: 50%;text-align: center;">[[queueListItems]]</p>
                            </div>
                            <div>
                                [[_computeValue(index)]]
                            </div>
                        </div>
                        
                    </template>
                </div>

                <div class="layout horizontal borders" style="height: 25%; width: 100%;">
                    <div style="height: 25%; width: 10%;"> Your Decision</div>
                    <div class="layout vertical borders" style="width: 45%;">
                        <div class="layout horizontal">
                            <p>Player you want to exchange position: 
                                    <span id='exchangeText'></span>
                            </p>
                            <input id="exchangePlayer" name="exchangePlayer" type="number" min="1" max="6" style="width: 10%;" required>
                        </div>
                        <div class="layout horizontal">
                            <template is="dom-if" if="[[ _showOffer() ]]">
                                <p>Your offer: 
                                    <span id='offerText'> </span>
                                </p>
                                <input id="offer" name="offer" type="number" min="1" max="[[payoff]]" style="width: 10%;" required>
                                
                            </template>
                        </div>
                        <template is="dom-if" if="[[ !requestSent ]]">
                            <button type="button" on-click="_handlerequest" style="background-color:#ADD8E6;"> Send your request</button>
                        </template>
                        <template is="dom-if" if="[[ requestSent ]]">
                            <button type="button" on-click="_handlecancel" style="background-color:#FF6961;"> Cancel your request</button>
                        </template>
                    </div>
                    </div class="layout  borders" style="width: 45%;">
                        <p>Message</p>
                        <input id="offer" type="text" required>
                    </div>
                </div>

                <div class="layout horizontal" style="height: 75%; width: 100%;">
                    <div class="layout vertical borders" style="width: 50%;">
                        <div>
                            <p>Exchange Requests:</p>
                        </div>
                        <template is="dom-repeat" index-as="index" items="{{requests}}" as="requestsVector">
                            <div class="layout horizontal borders" >
                                <p>Player [[_array(requestsVector, 0)]]</p>
                                <template is="dom-if" if="[[ _showOffer() ]]">
                                    <p>Amount [[_array(requestsVector, 1)]]</p>
                                </template>
                                <button type="button" on-click="_handleaccept">Accept</button>
                            </div>
                        </template>
                    </div>

                    <div class="layout vertical" style="width: 50%;">
                        <div class="layout vertical borders">
                            <div class="borders">Your current payoff: [[payoff]]</div>
                            <div class="borders">Exchange History</div>
                            <div class="borders">
                                <table>
                                    <tr> 
                                        <th>Original Position </th>
                                        <th>New Position </th>
                                        <th>Transfer </th>
                                    </tr>
                                    <template is="dom-repeat" index-as="index" items="{{history}}" as="historyVector">
                                        <tr> 
                                            <td>[[_array(historyVector, 0)]] </td>
                                            <td>[[_array(historyVector, 1)]] </td>
                                            <td>[[_array(historyVector, 2)]] </td>
                                        </tr>
                                    </template>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        
        `
    }

    static get properties() {
        return {
            groupDecisions: {
                type: Object,
            },
            _myDecision: {
                type: Number,
            },
            initialDecision:{
                type: Number,
            },
            initialPosition:{
                type: Number,
            },
            myPosition:{
                type: Number,
            },
            currentRequestPartner:{
                type: Number,
                value: 0
            },
            messaging:{
                type: Boolean,
                value: false,
            },
            payoff: {
                type: Number,
            },
            endowment:{
                type: Number,
            },
            queueList: {
                type: Array,
            },
            swapMethod: {
                type: String
            },
            value:{
                type: Number
            },
            requests: {
                type: Array,
            },
            history: {
                type: Array,
            },
            requestSent: {
                type: Boolean,
                value: false
            },
            _isPeriodRunning: {
                type: Boolean,
            },
            _subperiodProgress: {
                type: Number,
                value: 0,
            },
            periodLength: {
                type: Number
            },
            timeRemaining:{
                type: Number,
                value: 0,
            }
        }
    }

    _array(a, i) {
        console.log(a);
        console.log(a[i]);
        return a[i];
    }

    _reverse(list){
        return list.slice().reverse();
    }

    ready() {
        super.ready()
        console.log("Game Start");
        this.set('requests', []);
        this.set('myPosition', this.initialPosition);
        this.set('payoff', this.endowment);
        console.log( this.messaging);     
        
    }

    _shadeCircle(id){
        if(id == this.$.constants.idInGroup)
            return '#FF0000';
        else if (this.queueList.indexOf(id) < this.queueList.indexOf(this.$.constants.idInGroup))
            return '#D3D3D3';
        else
            return '#0000FF';
    }

    _maxOffer(){
        return this.payoff;
    }

    _computeValue(spot){
        spot = 5 - spot;
        return (6 - spot) * this.value;
    }

    _updateSubperiodProgress(t) {
        const deltaT = (t - this.lastT);
        const secondsPerSubperiod = this.periodLength / this.numSubperiods;
        this._subperiodProgress = 100 * ((deltaT / 1000) / secondsPerSubperiod);
        this._animID = window.requestAnimationFrame(
        this._updateSubperiodProgress.bind(this));
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

    _timeRemainingPeriod() {
        if((this.periodLength - this.now ) > 0) {
            return this.periodLength - (this.now );
        }
        else {
            return 0;
        }
    }
    _showOffer(){
        return this.swapMethod == 'TL';
    }
    _handleSwapEvent(event){
        console.log("Swap Event");
        console.log(event.detail.payload);
        let playerDecision = event.detail.payload;
        if(playerDecision['type'] == 'request' && playerDecision['receiver'] == parseInt(this.$.constants.idInGroup)){
            let request = [playerDecision['sender'], playerDecision['offer']];
            this.push('requests', request);
            console.log(this.requests);
        }
        if(playerDecision['type'] == 'cancel' && playerDecision['receiver'] == parseInt(this.$.constants.idInGroup)){
            let newRequests = [];
            for(let i = 0; i < this.requests.length; i++){
                console.log(this.requests[i])
                if (this.requests[i][0] != playerDecision['sender']){
                    newRequests.push(this.requests[i]);
                }

            }
            this.set('requests', newRequests);
        }
        if(playerDecision['type'] == 'accept'){
            console.log(this.requests);
            let newRequests = [];
            if(playerDecision['sender'] != parseInt(this.$.constants.idInGroup) && playerDecision['receiver'] != parseInt(this.$.constants.idInGroup)){
                for(let i = 0; i < this.requests.length; i++){
                    console.log(this.requests[i])
                    if (this.requests[i][0] != playerDecision['sender']){
                        newRequests.push(this.requests[i]);
                    }

                }
            } 
            
            this.set('requests', newRequests);
            let newQueueList = [];
            for(let i = 0; i < this.queueList.length; i++){
                newQueueList[i] = this.queueList[i];
            }

            let sIndex = this.queueList.indexOf(playerDecision['sender']);
            let rIndex = this.queueList.indexOf(playerDecision['receiver']);
            newQueueList[sIndex] = playerDecision['receiver'];
            newQueueList[rIndex] = playerDecision['sender'];
            if(playerDecision['sender'] == parseInt(this.$.constants.idInGroup)){
                this.set('myPosition', rIndex);
            }
            if(playerDecision['receiver'] == parseInt(this.$.constants.idInGroup)){
                this.set('myPosition', sIndex);
            }
            this.set('queueList', newQueueList);

            if(playerDecision['sender'] == parseInt(this.$.constants.idInGroup) || this.currentRequestPartner == playerDecision['sender']){
                this.set("requestSent", false);
                this.set('currentRequestPartner', 0);
                this.$.exchangeText.textContent = ' ';
                this.shadowRoot.querySelector('#offerText').textContent = ' ';
            }
            if( playerDecision['receiver'] == parseInt(this.$.constants.idInGroup) ){
                this.set("requestSent", false);
                this.set('currentRequestPartner', 0);
                let newPayoff = this.payoff - playerDecision['offer'];
                this.set("payoff", newPayoff);
            }
            
        }
    }
    
    _handlerequest(){
        console.log("request");
        let exchangePlayer = parseInt(this.$.exchangePlayer.value);
        
        if(this.queueList.indexOf(exchangePlayer) > this.myPosition){
            alert("This Player is behind you!");
            return;
        }
        if(exchangePlayer == parseInt(this.$.constants.idInGroup)){
            alert("This Player is you!");
            return;
        }
        if(this._showOffer()) if(this.shadowRoot.querySelector('#offer').value == ""){
            alert("Input an offer");
            return;
        }
        this.$.exchangeText.textContent = this.$.exchangePlayer.value;
        
        this.set("requestSent", true);
        this.set('currentRequestPartner', exchangePlayer);
        let newRequest = {
            'type': 'request',
            'sender': parseInt(this.$.constants.idInGroup),
            'receiver': exchangePlayer,
        };
        if(this._showOffer()){
            let offer = parseInt(this.shadowRoot.querySelector('#offer').value);
            this.shadowRoot.querySelector('#offerText').textContent = this.shadowRoot.querySelector('#offer').value;
            newRequest['offer'] = offer;
        } else{
            newRequest['offer'] = 0;
        }
        this.$.channel.send(newRequest);
    }
    _handlecancel(){
        console.log("cancel");
        this.set("requestSent", false);

        this.$.exchangeText.textContent = ' ';
        if(this._showOffer()){
            //this.$.offerText.textContent = ' ';
            this.shadowRoot.querySelector('#offerText').textContent = ' ';
        }

        let exchangePlayer = parseInt(this.$.exchangePlayer.value);
        let newRequest = {
            'type': 'cancel',
            'sender': parseInt(this.$.constants.idInGroup),
            'receiver': exchangePlayer,
            'offer': 0,
        };
        
        this.$.channel.send(newRequest);
    }
    _handleaccept(e) {
        console.log("accept");
        var requestsVector = e.model.requestsVector;
        
        let newRequest = {
            'type': 'accept',
            'sender': parseInt(this.$.constants.idInGroup),
            'receiver': parseInt(requestsVector[0]),
        };
        this.set("requestSent", false);
        this.$.exchangeText.textContent = ' ';

        
        if(this._showOffer()){
            let offer = parseInt(requestsVector[1]);
            newRequest['offer'] = offer;
            this.shadowRoot.querySelector('#offerText').textContent = ' ';
            let newPayoff = this.payoff + offer;
            this.set("payoff", newPayoff);
        } else{
            newRequest['offer'] = 0;
        }
        console.log(newRequest);
        this.$.channel.send(newRequest);
    }
}

window.customElements.define('leeps-queue', LeepsQueue);