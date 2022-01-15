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
                    border-radius:50%;
                    text-align: center;
                    vertical-align:middle;
                    height: 110px;
                    width: 110px;
                    margin-left:10px;
                    margin-right:10px;
                }

                paper-progress {
                    margin-bottom: 0.625em;
                    --paper-progress-height: 1.875em;
                }

                table {
                    border-collapse: collapse;
                    width: 100%;
                }

                td, th {
                    border: 1px solid #dddddd;
                    text-align: left;
                    padding: 8px;
                }

                tr:nth-child(even) {
                    background-color: #dddddd;
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

            <redwood-channel
                id="report"
                channel="report">
            </redwood-channel>

            <div class="layout horizontal center" style="width: 100%;">
                <div class="borders" style="width: 33%;">
                    Ronda: [[roundNumber]]
                </div>
                <div class="borders" style="width: 33%;">
                    Exchange Rule: [[swapMethod]]
                </div>
                <div class="borders" style="width: 33%;">
                    Messaging: [[messaging]]
                </div>
                <!--
                <div class="borders" style="width: 30%;">
                    Time Remaining: [[ _subperiodProgress ]]
                </div>
                -->
            </div>

            

            <div class="layout vertical center">
                <div class="layout horizontal borders" style="height: 160px; width: 100%;padding-top:10px;">
                    <div>
                        <div class="layout vertical center" style="text-align: center;">
                            <p style="height: 65px;
                                        width: 110px;">Position</p>
                            <p style="width: 110px;">Value</p>
                        </div>
                    </div>
                    <template is="dom-repeat" index-as="index" items="{{_reverse(queueList)}}" as="queueListItems">
                        <div class="layout vertical center" style="padding-top:5px;margin-right:{{_spacing(index)}};">
                            <template is="dom-if" if="{{!_button(index,queueList)}}">
                                <div class="circle" style="background-color:{{_shadeCircle(queueListItems, queueList)}};">
                                    <p style="font-size:150%;font-weight:bold;height: 50%;text-align: center;vertical-align:middle;">{{_reverseIndex(index)}}</p>
                                </div>
                            </template>
                            <template is="dom-if" if="{{_button(index,queueList)}}">
                                <button type="button" on-click="_pick" class="circle" style="background-color:{{_shadeCircle(queueListItems,queueList)}};">
                                    <p style="font-size:150%;font-weight:bold;height: 50%;text-align: center;vertical-align:middle;">{{_reverseIndex(index)}}</p>
                                </button>
                            </template>
                            
                            <div >
                                [[_computeValue(index)]]
                            </div>
                        </div>
                        
                    </template>
                </div>

                <div class="layout horizontal borders" style="height: 25%; width: 100%;">
                    <div style="height: 25%; width: 10%;text-align: center;"> Your Decision</div>
                    <div class="layout vertical borders" style="width: 45%;">
                        <div class="layout horizontal">
                            <p>Player you want to exchange position: 
                                    <span id='exchangeText'>[[exchangeText]]</span>
                            </p>
                        </div>
                        <div class="layout horizontal">
                            <template is="dom-if" if="[[ _showOffer() ]]">
                                <p>Your offer: </p>
                                <input id="offer" name="offer" type="number" min="1" max="[[payoff]]" style="width: 40%;height: 70%;" required>
                            </template>
                        </div>
                        <template is="dom-if" if="[[ !requestSent ]]">
                            <button type="button" on-click="_handlerequest" style="background-color:#ADD8E6;"> Send your request</button>
                        </template>
                        <template is="dom-if" if="[[ requestSent ]]">
                            <button type="button" on-click="_handlecancel" style="background-color:#FF6961;"> Cancel your request</button>
                        </template>
                        </div class="layout vertical  borders" style="width: 45%;">
                            <p style="margin-right:10px;margin-top:50px;">Message</p>
                            <template is="dom-if" if="[[ messaging ]]" >
                                <input id="message" type="text" style="height: 70px;padding-top:10px;padding-bottom:10px;margin-top:35px;margin-bottom:10px;"  required>
                            </template>
                            <template is="dom-if" if="[[ !messaging ]]">
                                <p style="margin-left:10px;margin-top:50px;">Disabled</p>
                            </template>
                    </div>
                    </div>
                    
                </div>

                <div class="layout horizontal" style="height: 500px; width: 100%;">
                    <div class="layout vertical borders" style="width: 50%;">
                        <div class="layout horizontal borders" style="width: 100%;">
                            <div class="borders" style="width: 50%;">
                                <p style="font-size:150%;">Exchange Requests:</p>
                            </div>
                            <div class="layout vertical borders" style="width: 50%;">
                                <p style="margin-top:2px;margin-bottom:2px;">Current Sent Request:</p>
                                <p style="margin-top:2px;margin-bottom:2px;">To Position: [[_list(currentRequest, "position")]]</p>
                                <template is="dom-if" if="[[ _showOffer() ]]">
                                    <p style="margin-top:2px;margin-bottom:2px;">Offer: [[_list(currentRequest, "offer")]]</p>
                                </template>
                                <template is="dom-if" if="[[ messaging ]]">
                                    <p style="margin-top:2px;margin-bottom:2px;overflow: auto; white-space:nowrap;">
                                        <span style="display:inline-block;">Message: [[_list(currentRequest, "message")]]</span>
                                    </p>
                                </template>
                            </div>
                        </div>
                        <div style="overflow: auto;">
                            <template is="dom-repeat" index-as="index" items="{{requests}}" as="requestsVector">
                                <div class="layout horizontal borders" style=" padding-right:5px;padding-left:15px;">
                                    <div class="layout vertical" >
                                        <div class="layout horizontal" style="padding-top:0px;">
                                            <p style="margin-right:10px;margin-top:2px;margin-bottom:2px;">Position: [[_list(requestsVector, "position")]]  </p>
                                            <template is="dom-if" if="[[ _showOfferButNotBid() ]]">
                                                <p style="display:inline;margin-top:2px;margin-bottom:2px;">Amount: [[_list(requestsVector, "offer")]]</p>
                                            </template>
                                            <template is="dom-if" if="[[ _isToken() ]]">
                                                <p style="display:inline;margin-top:2px;margin-bottom:2px;">Tokens: [[_list(requestsVector, "currentTokens")]]</p>
                                            </template>
                                        </div>
                                        <template is="dom-if" if="[[ messaging ]]">
                                            <div>
                                                Message:
                                                <p style="margin-top:2px;margin-bottom:2px;width:250px;overflow: auto;white-space:nowrap;">
                                                 <span style="display:inline-block;">[[_list(requestsVector, "message")]]</span>
                                                </p>
                                            </div>
                                        </template>
                                        
                                    </div>
                                    <div style="margin-top:9px;margin-left:13%;">
                                        <template is="dom-if" if="[[ _isDouble() ]]" >
                                            <input id={{_idString(requestsVector)}} name="bid" type="number" min="1" max="[[payoff]]" style="width: 45px;height: 60%;" required>
                                        </template>
                                    
                                    </div>
                                    <div class="layout vertical" style="margin-top:9px;margin-left:auto;">
                                            <button id="accept" type="button" on-click="_handleaccept" style="background-color:#ADD8E6;margin-bottom:5px;">
                                                <template is="dom-if" if="[[ _isDouble() ]]" >
                                                    Ask
                                                </template>
                                                <template is="dom-if" if="[[ !_isDouble() ]]" >
                                                    Accept
                                                </template>
                                            </button>
                                            <template is="dom-if" if="[[ !_isDouble() ]]">
                                                <button type="button" on-click="_handlereject" style="background-color:#FF6961;margin-bottom:5px;">Reject</button>
                                            </template>
                                            <template is="dom-if" if="[[ messaging ]]" style="padding-top:10px;padding-bottom:10px;">
                                                <button type="button" on-click="_handlereport" style="background-color:#B0B0B0;">Report</button>
                                            </template>
                                        </div>
                                </div>
                            </template>
                        </div>
                    </div>

                    <div class="layout vertical" style="width: 50%;">
                        <div class="layout vertical borders">
                            <div class="borders layout horizontal" style="height:40px;font-size:120%;">
                                <div style="width: 50%;">
                                    Endowment: [[endowment]]
                                </div>
                                <template is="dom-if" if="[[ _showOffer() ]]">
                                    <div style="width: 50%;">
                                        Total Transfer: [[transfer]]
                                    </div>
                                </template>
                                <template is="dom-if" if="[[ _isToken() ]]">
                                    <div style="width: 50%;">
                                        Total Tokens: [[tokens]]
                                    </div>
                                </template>
                                <template is="dom-if" if="[[ _isSwap() ]]">
                                    <div style="width: 50%;">
                                        Total Transfer: N/A
                                    </div>
                                </template>
                            </div>
                            <div class="borders" style="height:40px;font-size:150%;">Exchange History</div>
                            <div class="borders" style="height:400px;overflow: auto;">
                                <table>
                                    <tr> 
                                        <th>Original Position </th>
                                        <th>New Position </th>
                                        <th>Status </th>
                                        <template is="dom-if" if="[[ !_isToken() ]]">
                                            <th>Transfer </th>
                                        </template>
                                        <template is="dom-if" if="[[ _isToken() ]]">
                                            <th>Token </th>
                                        </template>
                                    </tr>
                                    <template is="dom-repeat" index-as="index" items="{{history}}" as="historyVector">
                                        <tr> 
                                            <td>[[_array(historyVector, 0)]] </td>
                                            <td>[[_array(historyVector, 1)]] </td>
                                            <td>[[_array(historyVector, 2)]] </td>
                                            <td>[[_array(historyVector, 3)]] </td>
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
            numPlayers:{
                type: Number,
            },
            currentRequestPartner:{
                type: Number,
                value: 0
            },
            currentRequest: {
                type: Object,
            },
            messaging:{
                type: Boolean,
                value: false,
            },
            payoff: {
                type: Number,
            },
            transfer: {
                type: Number,
            },
            tokens:{
                type: Number,
            },
            endowment:{
                type: Number,
            },
            queueList: {
                type: Array,
            },
            valueList: {
                type: Array,
            },
            swapMethod: {
                type: String
            },
            value:{
                type: Number
            },
            roundNumber:{
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
    _list(requestsVector, string){
        return requestsVector[string];
    }
    _reverse(list){
        return list.slice().reverse();
    }

    _reverseIndex(index){
        return this.numPlayers - parseInt(index);
    }

    _spacing(index){
        console.log(index);
        if(this.numPlayers == 5){
            return '25px';
        } else{
            return '10px';
        }
    }

    _showOfferButNotBid(){
        return this.swapMethod == 'TL';
    }

    ready() {
        super.ready()
        console.log(this.numPlayers);
        this.set('transfer', 0);
        this.set('requests', []);
        this.set('history', []);
        this.set('myPosition', this.initialPosition);
        this.set('payoff', this.endowment);
        this.set('exchangeText', "None");
        console.log(this.valueList)
        this.set('value', this.valueList[this.myPosition]);
        console.log(this.value);
        this.set("currentRequest", {'position': 'N/A', 'offer': 'N/A', 'message': 'N/A'});
        
    }

    _shadeCircle(id,queueList){
        if(id == this.$.constants.idInGroup)
            return '#FF0000';
        else if (queueList.indexOf(id) > queueList.indexOf(parseInt(this.$.constants.idInGroup))){
            return '#E7E7E7';
        }
        else{
            return '#C56BFF';
        }
            
    }

    _button(index,queueList){
        index = this.numPlayers - 1 - parseInt(index) ;
        if (index < queueList.indexOf(parseInt(this.$.constants.idInGroup))){
            return true;
        }
        else{
            return false;
        }

    }

    _pick(e){
        if (this.requestSent == true) {
            alert("To start a new request, you need to cancel the current one.");
            return;
        }
        var index = e.model.index;
        index = this.numPlayers - parseInt(index);
        this.set("exchangeText", index.toString() );
    }

    _maxOffer(){
        return this.payoff;
    }

    _computeValue(spot){
        spot = this.numPlayers - 1 - spot;
        return (this.numPlayers - spot) * this.value;
    }

    _computeValueForToken(spot){
        return (this.numPlayers - spot) * this.value;
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
    _updateSubperiodProgress(t) {
        const deltaT = (t - this.lastT);
        this._subperiodProgress = this.periodLength - Math.round(100 * ((deltaT / 1000) ));
        this._animID = window.requestAnimationFrame(
            this._updateSubperiodProgress.bind(this));
    }

    _timeRemainingPeriod() {
        if((this.periodLength - this.now ) > 0) {
            return this.periodLength - (this.now );
        }
        else {
            return 0;
        }
    }

    _isToken(){
        return this.swapMethod == 'Token';
    }

    _isSwap(){
        return this.swapMethod == 'Swap';
    }

    _isDouble(){
        return this.swapMethod == 'Double';
    }

    _isTL(){
        return this.swapMethod == 'TL';
    }

    _showOffer(){
        return this.swapMethod == 'TL' || this.swapMethod == 'Double';
    }
    _handleSwapEvent(event){
        console.log(event.detail.payload);
        let playerDecision = event.detail.payload;
        if(playerDecision['type'] == 'request' && playerDecision['receiverID'] == parseInt(this.$.constants.idInGroup)){
            console.log("request event");
            let request = {
                'position': playerDecision['senderPosition'] + 1,
                'offer': playerDecision['offer'],
                'message':playerDecision['message'],
                'currentTokens':'N/A'
            }
            if(this._isToken()) request['currentTokens'] = playerDecision['currentTokens'];
            this.push('requests', request);
            console.log(this.requests);
        }
        if(playerDecision['type'] == 'request' && playerDecision['senderID'] == parseInt(this.$.constants.idInGroup)){
            let curReq = {'position': playerDecision['receiverPosition'] + 1};
            curReq['message'] = playerDecision['message'];
            if(this._showOffer()){
                curReq['offer'] = playerDecision['offer'];
            } else{
                curReq['offer'] = 'N/A';
            }
            this.set("currentRequest", curReq);
        }
        if(playerDecision['type'] == 'cancel'){
            console.log("Cancel Event");
            if( playerDecision['receiverID'] == parseInt(this.$.constants.idInGroup) ){
                let newRequests = [];
                for(let i = 0; i < this.requests.length; i++){
                    console.log(this.requests[i]['position'])
                    console.log(playerDecision['senderPosition']+ 1)
                    if ((this.requests[i]['position']) != (playerDecision['senderPosition']+ 1)){
                        newRequests.push(this.requests[i]);
                    }

                }
                console.log(newRequests);
                this.set('requests', newRequests);
                this.set("requestSent", false);
                this.set('currentRequestPartner', 0);
                this.set("currentRequest", {'position': 'N/A', 'offer': 'N/A', 'message': 'N/A'});

                
                let rIndex = this.queueList.indexOf(playerDecision['receiverID']);
                let historyVector =[ rIndex + 1, rIndex+ 1,  'CANCELLED', -1 *playerDecision['offer'] ];
                if(this._isSwap()) historyVector[3] = 'N/A';
                this.push('history', historyVector);
            }
            if( playerDecision['senderID'] == parseInt(this.$.constants.idInGroup) ){
                this.set("requestSent", false);
                this.set('currentRequestPartner', 0);
                this.set("currentRequest", {'position': 'N/A', 'offer': 'N/A', 'message': 'N/A'});

                console.log("cancelled");
                let sIndex = this.queueList.indexOf(playerDecision['senderID']);
                let historyVector =[ sIndex + 1, sIndex+ 1,  'CANCELLED', playerDecision['offer'] ];
                if(this._isSwap()) historyVector[3] = 'N/A';
                this.push('history', historyVector);
                console.log(this.history);
            }
        }
        if(playerDecision['type'] == 'accept' && (this._isDouble() && playerDecision['transfer'] == 0)){
            // Case where ask was too high
            if( playerDecision['receiverID'] == parseInt(this.$.constants.idInGroup) ){
                this.set("requestSent", false);
                this.set('currentRequestPartner', 0);
                this.set("currentRequest", {'position': 'N/A', 'offer': 'N/A'});

                let rIndex = this.queueList.indexOf(playerDecision['receiverID']);
                let historyVector =[ rIndex + 1, rIndex+ 1,  'REJECTED', 0 ];
                if(this._isSwap()) historyVector[3] = 'N/A';
                this.push('history', historyVector);
            }
            if( playerDecision['senderID'] == parseInt(this.$.constants.idInGroup) ){
                let sIndex = this.queueList.indexOf(playerDecision['senderID']);
                let historyVector =[ sIndex + 1, sIndex+ 1,  'REJECTED', 0 ];
                if(this._isSwap()) historyVector[3] = 'N/A';
                this.push('history', historyVector);
            }
        }
        else if(playerDecision['type'] == 'accept'){
            console.log("accept");
            console.log(this.requests);
            let newRequests = [];
            if(playerDecision['senderID'] != parseInt(this.$.constants.idInGroup) && playerDecision['receiverID'] != parseInt(this.$.constants.idInGroup)){
                for(let i = 0; i < this.requests.length; i++){
                    console.log(this.requests[i])
                    if (this.requests[i]['position'] - 1 != playerDecision['senderPosition']){
                        newRequests.push(this.requests[i]);
                    }

                }
            } 
            
            this.set('requests', newRequests);
            console.log(this.requests);
            let newQueueList = [];
            for(let i = 0; i < this.queueList.length; i++){
                newQueueList[i] = this.queueList[i];
            }

            let sIndex = this.queueList.indexOf(playerDecision['senderID']);
            let rIndex = this.queueList.indexOf(playerDecision['receiverID']);
            newQueueList[sIndex] = playerDecision['receiverID'];
            newQueueList[rIndex] = playerDecision['senderID'];
            if(playerDecision['senderID'] == parseInt(this.$.constants.idInGroup)){
                this.set('myPosition', rIndex);
            }
            if(playerDecision['receiverID'] == parseInt(this.$.constants.idInGroup)){
                this.set('myPosition', sIndex);
            }
            
            this.set('queueList', newQueueList);
            console.log(this.queueList);
            let amount;
            if(this._isDouble())
                amount = playerDecision['transfer'];
            else
                amount = playerDecision['offer'];
            if(playerDecision['senderID'] == parseInt(this.$.constants.idInGroup) || this.currentRequestPartner == playerDecision['senderID']){
                this.set("requestSent", false);
                this.set('currentRequestPartner', 0);
                this.set("exchangeText", "None" );
                this.set("currentRequest", {'position': 'N/A', 'offer': 'N/A', 'message': 'N/A'});
            }
            if( playerDecision['receiverID'] == parseInt(this.$.constants.idInGroup) ){
                this.set("requestSent", false);
                this.set('currentRequestPartner', 0);
                this.set("currentRequest", {'position': 'N/A', 'offer': 'N/A', 'message': 'N/A'});
                if (!this._isToken()){                
                    let newPayoff = this.payoff - amount;
                    let newTransfer = this.transfer - amount;
                    this.set("payoff", newPayoff);
                    this.set("transfer", newTransfer);
                } else {
                    let newTokens = this.tokens - 1;
                    this.set("tokens", newTokens);
                }
            }
            
            if( playerDecision['receiverID'] == parseInt(this.$.constants.idInGroup) ){
                let historyVector =[ rIndex + 1, sIndex + 1, 'ACCEPTED', -1 *amount ];
                if(this._isSwap()) historyVector[3] = 'N/A';
                if(this._isToken()) historyVector[3] = -1;
                this.push('history', historyVector);
            }

            if( playerDecision['senderID'] == parseInt(this.$.constants.idInGroup) ){
                let historyVector =[ sIndex + 1, rIndex+ 1, 'ACCEPTED', amount ];
                if(this._isSwap()) historyVector[3] = 'N/A';
                if(this._isToken()) historyVector[3] = 1;
                this.push('history', historyVector);
            }
            
        }
        if(playerDecision['type'] == 'reject'){
            if( playerDecision['receiverID'] == parseInt(this.$.constants.idInGroup) ){
                this.set("requestSent", false);
                this.set('currentRequestPartner', 0);
                this.set("currentRequest", {'position': 'N/A', 'offer': 'N/A', 'message': 'N/A'});

                let rIndex = this.queueList.indexOf(playerDecision['receiverID']);
                let historyVector =[ rIndex + 1, rIndex+ 1,  'REJECTED', -1 *playerDecision['offer'] ];
                if(this._isSwap()) historyVector[3] = 'N/A';
                this.push('history', historyVector);
            }
            if( playerDecision['senderID'] == parseInt(this.$.constants.idInGroup) ){
                let sIndex = this.queueList.indexOf(playerDecision['senderID']);
                let historyVector =[ sIndex + 1, sIndex+ 1,  'REJECTED', playerDecision['offer'] ];
                if(this._isSwap()) historyVector[3] = 'N/A';
                this.push('history', historyVector);
            }
        }
    }
    
    _handlerequest(){
        if(this.requestSent){
            return;
        }
        console.log("request");
        this.set("requestSent", true);
        if(this.$.exchangeText.textContent == "None"){
            alert("Select a player!");
            this.set("requestSent", false);
            return;
        }
        let exchangePlayerIndex = parseInt(this.$.exchangeText.textContent) - 1;
        let exchangePlayer = this.queueList[exchangePlayerIndex];
        
        if(exchangePlayerIndex > this.myPosition){
            alert("This Player is behind you!");
            this.set("requestSent", false);
            return;
        }
        if(exchangePlayer == parseInt(this.$.constants.idInGroup)){
            alert("This Player is you!");
            this.set("requestSent", false);
            return;
        }
        if(this._showOffer()) {
            if(this.shadowRoot.querySelector('#offer').value == ""){
                alert("Input an offer");
                this.set("requestSent", false);
                return;
            }
            if(this._showOffer() && parseFloat(this.shadowRoot.querySelector('#offer').value) > this.payoff){
                alert("You don't have enough points");
                this.set("requestSent", false);
                return;
            }
            if(parseFloat(this.shadowRoot.querySelector('#offer').value) < 0){
                alert("You can't have a negative offer");
                this.set("requestSent", false);
                return;
            }
            console.log(this.myPosition);
            console.log(exchangePlayerIndex);
            console.log(this._computeValueForToken(this.myPosition));
            console.log(this._computeValueForToken(exchangePlayerIndex));
            if( this._computeValueForToken(this.myPosition) > (this._computeValueForToken(exchangePlayerIndex) - parseFloat(this.shadowRoot.querySelector('#offer').value))){
                if(this._isDouble()){
                    if (confirm("Your net gain from this exchange could be negative. Please confirm if you want to send the bid.")) {
    
                    } else {
                        this.set("requestSent", false);
                        return;
                    }
                } else{
                    if (confirm("Your net gain from this exchange is negative. Please confirm if you want to send the request.")) {
    
                    } else {
                        this.set("requestSent", false);
                        return;
                    }
                }
            }
        }
        
        this.set('currentRequestPartner', exchangePlayer);
        

        let newRequest = {
            'channel': 'incoming',
            'type': 'request',
            'senderID': parseInt(this.$.constants.idInGroup),
            'senderPosition': this.myPosition,
            'receiverID': exchangePlayer,
            'receiverPosition': exchangePlayerIndex,
            'currentTokens': this.tokens
            
        };

        let curReq = {'position': exchangePlayerIndex + 1};
        if(this.messaging && (this.shadowRoot.querySelector('#message').value != "" || this.shadowRoot.querySelector('#message').value != " ")){
            newRequest['message'] = this.shadowRoot.querySelector('#message').value;
            curReq['message'] = this.shadowRoot.querySelector('#message').value;
        }else{
            newRequest['message'] = "N/A";
        }
        if(this._showOffer()){
            let offer = parseFloat(this.shadowRoot.querySelector('#offer').value);
            //this.shadowRoot.querySelector('#offerText').textContent = this.shadowRoot.querySelector('#offer').value;
            newRequest['offer'] = offer;
            curReq['offer'] = offer;
        } else if (this._isToken()) {
            newRequest['offer'] = 1;
            curReq['offer'] = 'N/A';
        } else {
            newRequest['offer'] = 0;
            curReq['offer'] = 'N/A';
        }
        this.set("currentRequest", curReq);
        this.$.channel.send(newRequest);
    }

    _handlecancel(){
        console.log("cancel");
        this.set("requestSent", false);

        if(this._showOffer()){
            //this.$.offerText.textContent = ' ';
            //this.shadowRoot.querySelector('#offerText').textContent = ' ';
        }

        let exchangePlayer = this.currentRequestPartner;
        this.set("exchangeText", "None");
        let newRequest = {
            'channel': 'incoming',
            'type': 'cancel',
            'senderID': parseInt(this.$.constants.idInGroup),
            'senderPosition': this.myPosition,
            'receiverID': exchangePlayer,
            'receiverPosition': this.queueList.indexOf(exchangePlayer),
            'offer': 0,
            'currentTokens': this.tokens
        };
        this.set("currentRequest", {'position': 'N/A', 'offer': 'N/A', 'message': 'N/A'});
        
        this.$.channel.send(newRequest);
    }

    _idString(requestsVector){
        return 'bid' + this._list(requestsVector, "position").toString();
    }

    _handleaccept(e) {
        console.log("accept");
        var requestsVector = e.model.requestsVector;
        if(this._isDouble()) {
            let idString = '#' + this._idString(requestsVector);
            let ourBid = (this.shadowRoot.querySelector(idString).value);
            if(ourBid == ""){
                alert("Input an offer");
                this.set("requestSent", false);
                return;
            }
            if(parseFloat(ourBid) > this.payoff){
                alert("You don't have enough points");
                this.set("requestSent", false);
                return;
            }
            if(parseFloat(ourBid) < 0){
                alert("You can't have a negative offer");
                this.set("requestSent", false);
                return;
            }
            if( this._computeValueForToken(this.myPosition) > (this._computeValueForToken(parseInt(requestsVector['position'])- 1) + parseFloat(ourBid))){
                if (confirm("Your net gain from this exchange could be negative. Please confirm if you want to send the ask.")) {
                    
                } else {
                    this.set("requestSent", false);
                    return;
                }
            }
        }
        if(this._isTL()){
            if( this._computeValueForToken(this.myPosition) > (this._computeValueForToken(parseInt(requestsVector['position'])- 1) + parseFloat(requestsVector['offer']))){
                if (confirm("Your net gain from this exchange is negative. Please confirm if you want to accept the request.")) {
                    
                } else {
                    this.set("requestSent", false);
                    return;
                }
            }
        }

        let newRequest = {
            'channel': 'incoming',
            'type': 'accept',
            'senderID': parseInt(this.$.constants.idInGroup),
            'senderPosition': this.myPosition,
            'receiverID': this.queueList[parseInt(requestsVector['position']-1)],
            'receiverPosition': parseInt(requestsVector['position'])- 1,
        };
        this.set("requestSent", false);
        this.set("exchangeText", "None" );
        this.set("currentRequest", {'position': 'N/A', 'offer': 'N/A', 'message': 'N/A'});

        
        if(this._showOffer()){
            let offer = parseFloat(requestsVector['offer']);
            if(this._isDouble()){
                let idString = '#' + this._idString(requestsVector);
                let ourBid = parseFloat(this.shadowRoot.querySelector(idString).value);
                newRequest['offer'] = ourBid;
                let newTransfer = 0;
                newRequest['transfer'] = 0;
                if(offer >= ourBid){ //SWAP
                    newTransfer = (ourBid + offer) / 2;
                    newRequest['transfer'] = newTransfer;
                    let newPayoff = this.payoff + newTransfer;
                    newTransfer = this.transfer + newTransfer;
                    this.set("payoff", newPayoff);
                    this.set("transfer", newTransfer);
                } else{
                    let newRequests = [];
                    for(let i = 0; i < this.requests.length; i++){
                        console.log(this.requests[i])
                        if (this.requests[i]['position']  != requestsVector['position']){
                            newRequests.push(this.requests[i]);
                        }
                    }
                    this.set('requests', newRequests);
                }
            }else{
                newRequest['offer'] = offer;
                let newPayoff = this.payoff + offer;
                let newTransfer = this.transfer + offer;
                this.set("payoff", newPayoff);
                this.set("transfer", newTransfer);
            }
        } else if (this._isToken()){
            let newTokens = this.tokens + parseFloat(requestsVector['offer']);
            this.set("tokens", newTokens);
            newRequest['offer'] = 1;
            newRequest['currentTokens'] = this.tokens;
        } else{
            newRequest['offer'] = 0;
        }
        console.log(newRequest);
        this.$.channel.send(newRequest);
    }

    _handlereject(e) {
        console.log("reject");
        var requestsVector = e.model.requestsVector;

        let newRequests = [];
        for(let i = 0; i < this.requests.length; i++){
            console.log(this.requests[i])
            if (this.requests[i]['position']  != requestsVector['position']){
                newRequests.push(this.requests[i]);
            }
        }
        this.set('requests', newRequests);

        let newRequest = {
            'channel': 'incoming',
            'type': 'reject',
            'senderID': parseInt(this.$.constants.idInGroup),
            'senderPosition': this.myPosition,
            'receiverID': parseInt(this.queueList[requestsVector['position']-1]),
            'receiverPosition': parseInt(requestsVector['position']) - 1,
            'offer': 0,
            'currentTokens': this.tokens
        };
        console.log(newRequest);
        this.$.channel.send(newRequest);
    }

    _handlereport(e) {
        console.log("report");
        var requestsVector = e.model.requestsVector;
        var data = {
            'message': requestsVector['message']
        };

        this.$.report.send(data);
    }
}

window.customElements.define('leeps-queue', LeepsQueue);
