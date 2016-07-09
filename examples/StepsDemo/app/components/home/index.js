/**
 * Created by greg on 2016-06-30.
 */

import React, { Component } from 'react';
import {
    Navigator,
    TouchableOpacity,
    ScrollView,
    Image,
    Text,
    View
} from 'react-native';
import AppleHealthKit from 'react-native-apple-healthkit';
import styles from '../../styles/styles';
import History from './history';

// setup the HealthKit initialization options
const WPERMS = AppleHealthKit.Constants.Permissions.WRITE;
const RPERMS = AppleHealthKit.Constants.Permissions.READ;
const HKOPTIONS = {
    permissions: {
        read:  [
            RPERMS.StepCount,
            RPERMS.DistanceWalkingRunning,
            RPERMS.FlightsClimbed,
            RPERMS.Height,
        ],
        write: [
            WPERMS.StepCount
        ],
    }
};

/**
 * React Component
 */
class Home extends Component {

    constructor(props) {
        super(props);
        this.state = {
            stepsToday: 0,
            stepHistory: [],
        };
    }

    /**
     * if HealthKit is available on the device then initialize it
     * with the permissions set above in HKOPTIONS. on successful
     * initialization fetch today's steps and the step history
     */
    componentDidMount() {
        AppleHealthKit.isAvailable((err,available) => {
            if(available){
                AppleHealthKit.initHealthKit(HKOPTIONS, (err, res) => {
                    if(this._handleHKError(err, 'initHealthKit')){
                        return;
                    }
                    this._fetchStepsToday();
                    this._fetchStepsHistory();

                    //setTimeout(() => {
                    //
                    //    let options = {
                    //        value: 100,
                    //        startDate: (new Date(2016,6,2,6,0,0)).toISOString(),
                    //        endDate: (new Date(2016,6,2,6,30,0)).toISOString()
                    //    };
                    //    AppleHealthKit.saveSteps(options, (err, res) => {
                    //        if(this._handleHKError(err, 'saveSteps')){
                    //            return;
                    //        }
                    //        console.log('steps saved...');
                    //    });
                    //
                    //},1000);

                });
            }
        });
    }

    /**
     * get today's step count from HealthKit. on success update
     * the component state
     * @private
     */
    _fetchStepsToday() {
        AppleHealthKit.getStepCount(null, (err, steps) => {
            if(this._handleHKError(err, 'getStepCount')){
                return;
            }
            this.setState({stepsToday: steps});
        });
    }

    /**
     * get the step history from options.startDate through the
     * current time. on success update the component state
     * @private
     */
    _fetchStepsHistory() {
        let options = {
            startDate: (new Date(2016,4,1)).toISOString(),
        };
        AppleHealthKit.getDailyStepCountSamples(options, (err, res) => {
            if(this._handleHKError(err, 'getDailyStepCountSamples')){
                return;
            }
            console.log('res: ', res);
            this.setState({stepHistory: res});
        });
    }

    /**
     * render the Navigator which will render the navigation
     * bar and the scene
     * @returns {XML}
     */
    render() {
        return (
            <Navigator
                renderScene={this.renderScene.bind(this)}
                navigator={this.props.navigator}
                navigationBar={
                    <Navigator.NavigationBar style={styles.navigationBar}
                                             routeMapper={NavigationBarRouteMapper} />
                }/>
        );
    }

    /**
     * render the scene
     * @param route
     * @param navigator
     * @returns {XML}
     */
    renderScene(route, navigator) {
        return (
            <View style={styles.sceneContainerWithNavbar}>

                <View style={styles.stepsContainer}>
                    <Image style={styles.stepsIcon}
                           source={require('../../assets/images/steps.png')}>

                    </Image>
                    <Text style={styles.stepsLabel}>
                        Today's Steps
                    </Text>
                    <Text style={styles.stepsValue}>
                        {this.state.stepsToday}
                    </Text>
                </View>

                <View style={styles.historyContainer}>
                    <View style={styles.titleRow}>
                        <Text>
                            History
                        </Text>
                    </View>
                    <History data={this.state.stepHistory} />
                </View>

            </View>
        );
    }

    /**
     * if 'err' is truthy then log the error message and
     * return true indicating an error has occurred
     * @param err
     * @param method
     * @returns {boolean}
     * @private
     */
    _handleHKError(err, method) : boolean {
        if(err){
            let errStr = 'HealthKit_ERROR['+method+'] : ';
            errStr += (err && err.message) ? err.message : err;
            console.log(errStr);
            return true;
        }
        return false;
    }
}


var NavigationBarRouteMapper = {
    LeftButton(route, navigator, index, nextState) {
        return null;
    },
    RightButton(route, navigator, index, nextState) {
        return (
            <TouchableOpacity style={styles.navbarTitleTouchable}
                              onPress={() => { navigator.parentNavigator.push({name: 'Add'})}}>
                <Text style={styles.navbarPlusButton}>
                    +
                </Text>
            </TouchableOpacity>
        );
    },
    Title(route, navigator, index, nextState) {
        return (
            <TouchableOpacity style={styles.navbarTitleTouchable}>
                <Text style={styles.navbarTitle}>
                    HealthKit Steps
                </Text>
            </TouchableOpacity>
        );
    }
};

module.exports = Home;
export default Home;
