import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Text, View, InteractionManager, Dimensions, Animated } from 'react-native';
import { connect } from 'react-redux';
import parse from 'url-parse';

import moment from 'moment';
import * as Haptics from 'expo-haptics';
import { Q } from '@nozbe/watermelondb';
import { dequal } from 'dequal';
import { withSafeAreaInsets } from 'react-native-safe-area-context';
import { HeaderBackButton } from '@react-navigation/elements';
import ScrollBottomSheet from 'react-native-scroll-bottom-sheet';

import Touch from '../../../../utils/touch';
import {
	replyBroadcast as replyBroadcastAction
} from '../../../../actions/messages';
import database from '../../../../lib/database';
import RocketChat from '../../../../lib/rocketchat';
import Message from '../../../../containers/Feedsmessage';
import MessageActions from '../../../../containers/MessageActions';
import MessageErrorActions from '../../../../containers/MessageErrorActions';
import styles from './styles';
import log, { logEvent, events } from '../../../../utils/log';
import EventEmitter from '../../../../utils/events';
import I18n from '../../../../i18n';
import LeftButtons from './LeftButtons';
import StatusBar from '../../../../containers/StatusBar';
import { themes } from '../../../../constants/colors';
import { MESSAGE_TYPE_ANY_LOAD, MESSAGE_TYPE_LOAD_MORE } from '../../../../constants/messageTypeLoad';
import debounce from '../../../../utils/debounce';
import { LISTENER } from '../../../../containers/Toast';

import { isReadOnly } from '../../../../utils/isReadOnly';
import { isIOS, isTablet } from '../../../../utils/deviceInfo';
import { showErrorAlert } from '../../../../utils/info';
import { withTheme } from '../../../../theme';
import {
	KEY_COMMAND,
	handleCommandScroll,
	handleCommandRoomActions,
	handleCommandSearchMessages,
	handleCommandReplyLatest
} from '../../../../commands';
import { Review } from '../../../../utils/review';
import RoomClass from '../../../../lib/methods/subscriptions/room';
import { getUserSelector } from '../../../../selectors/login';
import { CONTAINER_TYPES } from '../../../../lib/methods/actions';
import Navigation from '../../../../lib/Navigation';
import SafeAreaView from '../../../../containers/SafeAreaView';
import { withDimensions } from '../../../../dimensions';

import { takeInquiry } from '../../../../ee/omnichannel/lib';
import Loading from '../../../../containers/Loading';
import RoomServices from '../../../../views/RoomView/services';
import random from '../../../../utils/random';
import Tools from "./Item/Tools"
import StartAndComment from "./Item/StartAndComment"
import VideoPlayer from "./Item/Video"
import { sendMessageCall } from "../../../../lib/methods/sendMessage"
import { Handle } from "../../../../containers/ActionSheet/Handle"
import FeedsRoomView from "../FeedsRoomView"
import {

	Value,

} from 'react-native-reanimated';
const { height: windowHeight } = Dimensions.get("window")
const screenOptions = {
	title: /** @type {string} */ (null),
	headerShadowVisible: false,
	headerTransparent: true,
	statusBarTranslucent: true,
	statusBarStyle: 'light',
	headerBackgroundContainerStyle: {
		backgroundColor: 'rgba(255,255,255,1)',
		opacity: 0
	},
	headerTintColor: 'rgba(255,255,255,1)',
	headerTitleStyle: {
		color: 'rgba(255,255,255,1)',
		fontSize: 18,
		fontWeight: '500',
		lineHeight: 25,
	},
	headerLeft: null,
	headerShown: true,
	contentStyle: {
		backgroundColor: 'white',
	},
}
const VideoRoomViewInner = (props) => {
	const [likeCount, _setLikeCount] = useState(0)
	const [open, setOpen] = useState(false)
	const { item } = props.route.params
	const { theme } = props
	const animatedPosition = useRef(new Value(0));

	useEffect(() => {
		const i = item.reactions.find((i) => i.emoji === ':+1:')
		if (i) {
			setLikeCount(i.usernames.length)
		}
	}, [])
	// animatedPosition.current.(value => {
	// 	// console.info(value.x, 'asdasd')
	// 	console.info(value, 'ahsahdhahhd')
	// });
	const roomViewRef = useRef(null)
	const setLikeCount = (n) => {
		_setLikeCount(likeCount + n)
	}
	const showComments = () => {
		// 弹出展示聊天的界面
		setOpen(!open)
	}
	return (
		<View style={styles.container}>

			<VideoPlayer {...props} item={item} autoplay={true}
				animatedPosition={animatedPosition}
				showComments={showComments}
				likeCount={likeCount}
				setLikeCount={setLikeCount}
				uri={'https://video-message-003.paiyaapp.com/32eedd8c0dd84631a455ce170a21162a/8cd4fdd8ed2745539c021dd7772f25a1-d7f33bb2cf9375ac00b4911db56938d8-sd.mp4'} />
			<FeedsRoomView  {...props} mode={'modal'} open={open} animatedPosition={animatedPosition} />

		</View>
	)
}
class VideoRoomView extends React.Component {
	constructor(props) {
		super()
	}
	onPress = () => {
		this.props.navigation.goBack()
	}
	componentDidMount() {
		this.props.navigation.setOptions({
			headerLeft: () => (
				<HeaderBackButton
					label={''}
					onPress={this.onPress}
					tintColor={'white'}

					// backImage={() => {
					//     return <View style={{ backgroundColor: "red", width: 100, height: 100 }} />
					// }}
					style={{
						marginLeft: 10,

					}}

				/>

			),
		})
	}
	render() {
		return (
			<>
				<StatusBar barStyle='light-content' />

				<VideoRoomViewInner {...this.props} />
			</>
		)
	}
}

const mapStateToProps = state => ({
	user: getUserSelector(state),
	isMasterDetail: state.app.isMasterDetail,
	appState: state.app.ready && state.app.foreground ? 'foreground' : 'background',
	useRealName: state.settings.UI_Use_Real_Name,
	isAuthenticated: state.login.isAuthenticated,
	Message_GroupingPeriod: state.settings.Message_GroupingPeriod,
	Message_TimeFormat: state.settings.Message_TimeFormat,
	customEmojis: state.customEmojis,
	baseUrl: state.server.server,
	Message_Read_Receipt_Enabled: state.settings.Message_Read_Receipt_Enabled,
	Hide_System_Messages: state.settings.Hide_System_Messages
});

const mapDispatchToProps = dispatch => ({
	replyBroadcast: message => dispatch(replyBroadcastAction(message))
});

export default {
	component: connect(mapStateToProps, mapDispatchToProps)(withDimensions(withTheme(withSafeAreaInsets(VideoRoomView)))),
	options: screenOptions
}