import { NativeModules, NativeEventEmitter } from 'react-native';

const MPush = NativeModules.MPushModule;
const emitter = new NativeEventEmitter(MPush);

export default {
	...MPush,
	emitter
};
