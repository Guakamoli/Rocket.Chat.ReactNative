import React from 'react';
import PropTypes from 'prop-types';
import { Text, View, InteractionManager } from 'react-native';
import { connect } from 'react-redux';
import parse from 'url-parse';

import moment from 'moment';
import * as Haptics from 'expo-haptics';
import { Q } from '@nozbe/watermelondb';
import { dequal } from 'dequal';
import { withSafeAreaInsets } from 'react-native-safe-area-context';

import Touch from '../../../../utils/touch';
import {
	replyBroadcast as replyBroadcastAction
} from '../../../../actions/messages';
import List from './List';
import database from '../../../../lib/database';
import RocketChat from '../../../../lib/rocketchat';
import Message from '../../../../containers/Feedsmessage';
import MessageActions from '../../../../containers/MessageActions';
import MessageErrorActions from '../../../../containers/MessageErrorActions';
import MessageBox from './MessageBox';
import styles from './styles';
import log, { logEvent, events } from '../../../../utils/log';
import EventEmitter from '../../../../utils/events';
import I18n from '../../../../i18n';
import LeftButtons from './LeftButtons';
import StatusBar from '../../../../containers/StatusBar';
import Separator from './Separator';
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
import LoadMore from './LoadMore';
import RoomServices from '../../../../views/RoomView/services';
import random from '../../../../utils/random';

import { sendMessageCall } from "../../../../lib/methods/sendMessage"
const stateAttrsUpdate = [
	'joined',
	'lastOpen',
	'reactionsModalVisible',
	'canAutoTranslate',
	'selectedMessage',
	'loading',
	'editing',
	'replying',
	'readOnly',
	'showingBlockingLoader'
];
const roomAttrsUpdate = ['f', 'ro', 'blocked', 'blocker', 'archived', 'tunread', 'muted', 'ignored', 'jitsiTimeout', 'announcement', 'sysMes', 'topic', 'name', 'roles', 'visitor', 'joinCodeRequired', 'teamId'];

class RoomView extends React.Component {
	static propTypes = {
		navigation: PropTypes.object,
		route: PropTypes.object,
		user: PropTypes.shape({
			id: PropTypes.string.isRequired,
			username: PropTypes.string.isRequired,
			token: PropTypes.string.isRequired,
			showMessageInMainThread: PropTypes.bool
		}),
		appState: PropTypes.string,
		useRealName: PropTypes.bool,
		isAuthenticated: PropTypes.bool,
		Message_GroupingPeriod: PropTypes.number,
		Message_TimeFormat: PropTypes.string,
		Message_Read_Receipt_Enabled: PropTypes.bool,
		Hide_System_Messages: PropTypes.array,
		baseUrl: PropTypes.string,
		customEmojis: PropTypes.object,
		isMasterDetail: PropTypes.bool,
		theme: PropTypes.string,
		replyBroadcast: PropTypes.func,
		width: PropTypes.number,
		height: PropTypes.number,
		insets: PropTypes.object
	};

	constructor(props) {
		super(props);
		console.time(`${this.constructor.name} init`);
		console.time(`${this.constructor.name} mount`);
		this.rid = props.route.params?.rid;
		this.t = props.route.params?.t;
		this.tmid = props.route.params?.tmid;
		const selectedMessage = props.route.params?.message;
		const name = props.route.params?.name;
		const fname = props.route.params?.fname;
		const prid = props.route.params?.prid;
		const room = props.route.params?.room ?? {
			rid: this.rid, t: this.t, name, fname, prid
		};
		this.jumpToMessageId = props.route.params?.jumpToMessageId;
		const roomUserId = props.route.params?.roomUserId ?? RocketChat.getUidDirectMessage(room);
		this.state = {
			joined: true,
			room,
			roomUpdate: {},
			lastOpen: null,
			reactionsModalVisible: false,
			selectedMessage: selectedMessage || {},
			canAutoTranslate: false,
			loading: true,
			showingBlockingLoader: false,
			editing: false,
			replying: !!selectedMessage,
			replyWithMention: false,
			readOnly: false,
			unreadsCount: null,
			roomUserId
		};
		this.setHeader();

		if (room && room.observe) {
			this.observeRoom(room);
		} else if (this.rid) {
			this.findAndObserveRoom(this.rid);
		}

		this.setReadOnly();

		this.messagebox = React.createRef();
		this.list = React.createRef();
		this.flatList = React.createRef();
		this.mounted = false;

		// we don't need to subscribe to threads
		if (this.rid && !this.tmid) {
			this.sub = new RoomClass(this.rid);
		}
		console.timeEnd(`${this.constructor.name} init`);
	}

	componentDidMount() {

		this.offset = 0;
		this.didMountInteraction = InteractionManager.runAfterInteractions(() => {
			const { isAuthenticated } = this.props;
			this.setHeader();
			if (this.rid) {
				this.sub?.subscribe?.();
				if (isAuthenticated) {
					this.init();
				} else {
					EventEmitter.addEventListener('connected', this.handleConnected);
				}
			}
			if (this.jumpToMessageId) {
				this.jumpToMessage(this.jumpToMessageId);
			}
			if (isIOS && this.rid) {
				this.updateUnreadCount();
			}
		});
		if (isTablet) {
			EventEmitter.addEventListener(KEY_COMMAND, this.handleCommands);
		}
		EventEmitter.addEventListener('ROOM_REMOVED', this.handleRoomRemoved);
		console.timeEnd(`${this.constructor.name} mount`);
	}

	shouldComponentUpdate(nextProps, nextState) {
		const { state } = this;
		const { roomUpdate } = state;
		const {
			appState, theme, insets, route
		} = this.props;
		if (theme !== nextProps.theme) {
			return true;
		}
		if (appState !== nextProps.appState) {
			return true;
		}

		const stateUpdated = stateAttrsUpdate.some(key => nextState[key] !== state[key]);
		if (stateUpdated) {
			return true;
		}
		if (!dequal(nextProps.insets, insets)) {
			return true;
		}
		if (!dequal(nextProps.route?.params, route?.params)) {
			return true;
		}
		return roomAttrsUpdate.some(key => !dequal(nextState.roomUpdate[key], roomUpdate[key]));
	}

	componentDidUpdate(prevProps, prevState) {
		const { roomUpdate } = this.state;
		const { appState, insets, route } = this.props;

		if (route?.params?.jumpToMessageId !== prevProps.route?.params?.jumpToMessageId) {
			this.jumpToMessage(route?.params?.jumpToMessageId);
		}

		if (appState === 'foreground' && appState !== prevProps.appState && this.rid) {
			// Fire List.query() just to keep observables working
			if (this.list && this.list.current) {
				this.list.current?.query?.();
			}
		}
		this.setReadOnly();
	}

	async componentWillUnmount() {
		const { editing, room } = this.state;
		const db = database.active;
		this.mounted = false;
		if (!editing && this.messagebox && this.messagebox.current) {
			const { text } = this.messagebox.current;
			let obj;
			if (this.tmid) {
				try {
					const threadsCollection = db.get('threads');
					obj = await threadsCollection.find(this.tmid);
				} catch (e) {
					// Do nothing
				}
			} else {
				obj = room;
			}
			if (obj) {
				try {
					await db.action(async () => {
						await obj.update((r) => {
							r.draftMessage = text;
						});
					});
				} catch (error) {
					// Do nothing
				}
			}
		}
		this.unsubscribe();
		if (this.didMountInteraction && this.didMountInteraction.cancel) {
			this.didMountInteraction.cancel();
		}
		if (this.willBlurListener && this.willBlurListener.remove) {
			this.willBlurListener.remove();
		}
		if (this.subSubscription && this.subSubscription.unsubscribe) {
			this.subSubscription.unsubscribe();
		}
		if (this.queryUnreads && this.queryUnreads.unsubscribe) {
			this.queryUnreads.unsubscribe();
		}
		EventEmitter.removeListener('connected', this.handleConnected);
		if (isTablet) {
			EventEmitter.removeListener(KEY_COMMAND, this.handleCommands);
		}
		EventEmitter.removeListener('ROOM_REMOVED', this.handleRoomRemoved);
		console.countReset(`${this.constructor.name}.render calls`);
	}

	get isOmnichannel() {
		const { room } = this.state;
		return room.t === 'l';
	}

	setHeader = () => {
		const {
			room, unreadsCount,
		} = this.state;
		const {
			navigation, isMasterDetail, theme, baseUrl, user, route
		} = this.props;
		const { tmid } = this;
		let title = route.params?.name;
		let parentTitle;
		if ((room.id || room.rid) && !tmid) {
			title = RocketChat.getRoomTitle(room);
		}
		if (tmid) {
			parentTitle = RocketChat.getRoomTitle(room);
		}
		const t = room?.t;
		const { id: userId, token } = user;
		const avatar = room?.name;
		if (!room?.rid) {
			return;
		}
		navigation.setOptions({
			headerShown: true,
			headerTitleAlign: 'center',

			headerLeft: () => (
				<LeftButtons
					tmid={tmid}
					unreadsCount={unreadsCount}
					navigation={navigation}
					baseUrl={baseUrl}
					userId={userId}
					token={token}
					title={avatar}
					theme={theme}
					t={t}
					isMasterDetail={isMasterDetail}
				/>
			),

			headerTitle: () => (
				<Text style={{
					fontSize: 15, lineHeight: 21, fontWeight: "600", color: "#2F2D2DFF"
				}}>评论</Text>
			),
			headerRight: () => null
		});
	}



	setReadOnly = async () => {
		const { room } = this.state;
		const { user } = this.props;
		const readOnly = await isReadOnly(room, user);
		this.setState({ readOnly });
	}

	init = async () => {
		try {
			this.setState({ loading: true });
			const { room, joined } = this.state;
			if (this.tmid) {
				await RoomServices.getThreadMessages(this.tmid, this.rid);
			} else {
				const newLastOpen = new Date();
				await RoomServices.getMessages(room);

				// if room is joined
				if (joined) {
					if (room.alert || room.unread || room.userMentions) {
						this.setLastOpen(room.ls);
					} else {
						this.setLastOpen(null);
					}
					RoomServices.readMessages(room.rid, newLastOpen, true).catch(e => console.log(e));
				}
			}

			const canAutoTranslate = RocketChat.canAutoTranslate();
			this.mounted = true;
			this.setState({ canAutoTranslate, loading: false });
		} catch (e) {
			this.setState({ loading: false });
			this.retryInit = this.retryInit + 1 || 1;
			if (this.retryInit <= 1) {
				this.retryInitTimeout = setTimeout(() => {
					this.init();
				}, 300);
			}
		}
	}



	findAndObserveRoom = async (rid) => {
		try {
			const db = database.active;
			const subCollection = await db.get('subscriptions');
			const room = await subCollection.find(rid);
			this.setState({ room });
			if (!this.tmid) {
				this.setHeader();
			}
			this.observeRoom(room);
		} catch (error) {
			if (this.t !== 'd') {
				console.log('Room not found');
				this.internalSetState({ joined: false });
			}
			if (this.rid) {
				// We navigate to RoomView before the Room is inserted to the local db
				// So we retry just to make sure we have the right content
				this.retryFindCount = this.retryFindCount + 1 || 1;
				if (this.retryFindCount <= 3) {
					this.retryFindTimeout = setTimeout(() => {
						this.findAndObserveRoom(rid);
						this.init();
					}, 300);
				}
			}
		}
	}

	unsubscribe = async () => {
		if (this.sub && this.sub.unsubscribe) {
			await this.sub.unsubscribe();
		}
		delete this.sub;
	}

	observeRoom = (room) => {
		const observable = room.observe();
		this.subSubscription = observable
			.subscribe((changes) => {
				const roomUpdate = roomAttrsUpdate.reduce((ret, attr) => {
					ret[attr] = changes[attr];
					return ret;
				}, {});
				if (this.mounted) {
					this.internalSetState({ room: changes, roomUpdate });
				} else {
					this.state.room = changes;
					this.state.roomUpdate = roomUpdate;
				}
			});
	}

	errorActionsShow = (message) => {
		this.messageErrorActions?.showMessageErrorActions(message);
	}

	onEditInit = (message) => {
		const newMessage = {
			id: message.id,
			subscription: {
				id: message.subscription.id
			},
			msg: message?.attachments?.[0]?.description || message.msg
		};
		this.setState({ selectedMessage: newMessage, editing: true });
	}

	onEditCancel = () => {
		this.setState({ selectedMessage: {}, editing: false });
	}

	onEditRequest = async (message) => {
		this.setState({ selectedMessage: {}, editing: false });
		try {
			await RocketChat.editMessage(message);
		} catch (e) {
			log(e);
		}
	}

	onReplyInit = (message, mention) => {
		this.setState({
			selectedMessage: message, replying: true, replyWithMention: mention
		});
	}

	onReplyCancel = () => {
		this.setState({ selectedMessage: {}, replying: false, replyWithMention: false });
	}



	onMessageLongPress = (message) => {
		this.messageActions?.showMessageActions(message);
	}

	showAttachment = (attachment) => {
		const { navigation } = this.props;
		navigation.navigate('AttachmentView', { attachment });
	}

	onReactionPress = async (shortname, messageId) => {
		try {
			await RocketChat.setReaction(shortname, messageId);
			this.onReactionClose();
			Review.pushPositiveEvent();
		} catch (e) {
			log(e);
		}
	};

	onReactionLongPress = (message) => {
		this.setState({ selectedMessage: message, reactionsModalVisible: true });
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
	}

	onCloseReactionsModal = () => {
		this.setState({ selectedMessage: {}, reactionsModalVisible: false });
	}

	onEncryptedPress = () => {
		logEvent(events.ROOM_ENCRYPTED_PRESS);
		const { navigation, isMasterDetail } = this.props;

		const screen = { screen: 'E2EHowItWorksView', params: { showCloseModal: true } };

		if (isMasterDetail) {
			return navigation.navigate('ModalStackNavigator', screen);
		}
		navigation.navigate('E2ESaveYourPasswordStackNavigator', screen);
	}

	onDiscussionPress = debounce((item) => {
		const { navigation } = this.props;
		navigation.push('RoomView', {
			rid: item.drid, prid: item.rid, name: item.msg, t: 'p'
		});
	}, 1000, true)

	// eslint-disable-next-line react/sort-comp
	updateUnreadCount = async () => {
		const db = database.active;
		const observable = await db.collections
			.get('subscriptions')
			.query(
				Q.where('archived', false),
				Q.where('open', true),
				Q.where('rid', Q.notEq(this.rid))
			)
			.observeWithColumns(['unread']);

		this.queryUnreads = observable.subscribe((data) => {
			const { unreadsCount } = this.state;
			const newUnreadsCount = data.filter(s => s.unread > 0).reduce((a, b) => a + (b.unread || 0), 0);
			if (unreadsCount !== newUnreadsCount) {
				this.setState({ unreadsCount: newUnreadsCount }, () => this.setHeader());
			}
		});
	};


	shouldNavigateToRoom = (message) => {
		if (message.tmid && message.tmid === this.tmid) {
			return false;
		}
		if (!message.tmid && message.rid === this.rid) {
			return false;
		}
		return true;
	}



	jumpToMessage = async (messageId) => {
		try {
			this.setState({ showingBlockingLoader: true });
			const message = await RoomServices.getMessageInfo(messageId);

			if (!message) {
				return;
			}

			if (this.shouldNavigateToRoom(message)) {

			} else {
				/**
				 * if it's from server, we don't have it saved locally and so we fetch surroundings
				 * we test if it's not from threads because we're fetching from threads currently with `getThreadMessages`
				 */
				if (message.fromServer && !message.tmid) {
					await RocketChat.loadSurroundingMessages({ messageId, rid: this.rid });
				}
				await Promise.race([
					this.list.current.jumpToMessage(message.id),
					new Promise(res => setTimeout(res, 5000))
				]);
				this.list.current.cancelJumpToMessage();
			}
		} catch (e) {
			log(e);
		} finally {
			this.setState({ showingBlockingLoader: false });
		}
	}

	replyBroadcast = (message) => {
		const { replyBroadcast } = this.props;
		replyBroadcast(message);
	}

	handleConnected = () => {
		this.init();
		EventEmitter.removeListener('connected', this.handleConnected);
	}

	handleRoomRemoved = ({ rid }) => {
		const { room } = this.state;
		if (rid === this.rid) {
			Navigation.navigate('RoomsListView');
			!this.isOmnichannel && showErrorAlert(I18n.t('You_were_removed_from_channel', { channel: RocketChat.getRoomTitle(room) }), I18n.t('Oops'));
		}
	}

	internalSetState = (...args) => {
		if (!this.mounted) {
			return;
		}
		this.setState(...args);
	}

	sendMessage = async (message, tmid, tshow) => {
		logEvent(events.ROOM_SEND_MESSAGE);
		const { user } = this.props;
		console.info(this.state.selectedMessage, 'this.state.selectedMessage')

		RocketChat.sendMessage(this.rid, message, this.tmid || tmid, user, tshow).then(() => {
			if (this.list && this.list.current) {
				this.list.current.update();
			}
			this.setLastOpen(null);
			Review.pushPositiveEvent();
		});


	};

	getCustomEmoji = (name) => {
		const { customEmojis } = this.props;
		const emoji = customEmojis[name];
		if (emoji) {
			return emoji;
		}
		return null;
	}

	setLastOpen = lastOpen => this.setState({ lastOpen });

	onJoin = () => {
		this.internalSetState({
			joined: true
		});
	}

	joinRoom = async () => {
		logEvent(events.ROOM_JOIN);
		try {
			const { room } = this.state;

			if (this.isOmnichannel) {
				await takeInquiry(room._id);
				this.onJoin();
			} else {
				const { joinCodeRequired } = room;
				if (joinCodeRequired) {
					this.joinCode.current?.show();
				} else {
					await RocketChat.joinRoom(this.rid, null, this.t);
					this.onJoin();
				}
			}
		} catch (e) {
			log(e);
		}
	}



	handleCommands = ({ event }) => {
		if (this.rid) {
			const { input } = event;
			if (handleCommandScroll(event)) {
				const offset = input === 'UIKeyInputUpArrow' ? 100 : -100;
				this.offset += offset;
				this.flatList?.scrollToOffset({ offset: this.offset });
			} else if (handleCommandReplyLatest(event)) {
				if (this.list && this.list.current) {
					const message = this.list.current.getLastMessage();
					this.onReplyInit(message, false);
				}
			}
		}
	}



	renderActions = () => {
		const { room, readOnly } = this.state;
		const { user } = this.props;
		return (
			<>
				<MessageActions
					ref={ref => this.messageActions = ref}
					tmid={this.tmid}
					room={room}
					user={user}
					editInit={this.onEditInit}
					replyInit={this.onReplyInit}
					reactionInit={this.onReactionInit}
					onReactionPress={this.onReactionPress}
					isReadOnly={readOnly}
				/>
				<MessageErrorActions
					ref={ref => this.messageErrorActions = ref}
					tmid={this.tmid}
				/>
			</>
		);
	}


	onLoadMoreMessages = loaderItem => RoomServices.getMoreMessages({
		rid: this.rid, tmid: this.tmid, t: this.t, loaderItem
	})

	renderItem = (item, previousItem, highlightedMessage, messages) => {
		const { room, lastOpen, canAutoTranslate } = this.state;
		const {
			user, Message_GroupingPeriod, Message_TimeFormat, useRealName, baseUrl, Message_Read_Receipt_Enabled, theme,
			navigation
		} = this.props;

		if (!previousItem) {
			dateSeparator = item.ts;
			showUnreadSeparator = moment(item.ts).isAfter(lastOpen);
		} else {
			showUnreadSeparator = lastOpen
				&& moment(item.ts).isSameOrAfter(lastOpen)
				&& moment(previousItem.ts).isBefore(lastOpen);
			if (!moment(item.ts).isSame(previousItem.ts, 'day')) {
				dateSeparator = item.ts;
			}
		}
		console.info(item, 'item')
		let content = null;
		if (MESSAGE_TYPE_ANY_LOAD.includes(item.t)) {
			content = <LoadMore load={() => this.onLoadMoreMessages(item)} type={item.t} runOnRender={item.t === MESSAGE_TYPE_LOAD_MORE && !previousItem} />;
		} else {
			content = (
				<>
					<Message
						item={item}
						user={user}
						rid={room.rid}
						archived={room.archived}
						broadcast={room.broadcast}
						status={item.status}
						isThreadRoom={!!this.tmid}
						previousItem={previousItem}
						onReactionPress={this.onReactionPress}
						onReactionLongPress={this.onReactionLongPress}
						onLongPress={this.onMessageLongPress}
						onEncryptedPress={this.onEncryptedPress}
						onDiscussionPress={this.onDiscussionPress}
						onAnswerButtonPress={this.sendMessage}
						showAttachment={this.showAttachment}
						reactionInit={this.onReactionInit}
						replyBroadcast={this.replyBroadcast}
						errorActionsShow={this.errorActionsShow}
						baseUrl={baseUrl}
						Message_GroupingPeriod={Message_GroupingPeriod}
						timeFormat={Message_TimeFormat}
						useRealName={useRealName}
						isReadReceiptEnabled={Message_Read_Receipt_Enabled}
						autoTranslateRoom={canAutoTranslate && room.autoTranslate}
						autoTranslateLanguage={room.autoTranslateLanguage}
						getCustomEmoji={this.getCustomEmoji}
						highlighted={highlightedMessage === item.id}
					/>
					<List
						// ref={this.list}
						// listRef={this.flatList}
						rid={this.rid}
						t={t}
						tmid={this.tmid}
						theme={theme}
						tunread={room?.tunread}
						ignored={room?.ignored}
						renderRow={this.renderItem}
						// loading={loading}
						navigation={navigation}
						hideSystemMessages={true}
						showMessageInMainThread={false}
					/>
				</>

			);
		}



		return content;
	}

	renderFooter = () => {
		const {
			joined, room, selectedMessage, editing, replying, replyWithMention, readOnly
		} = this.state;
		const { navigation, theme, user } = this.props;

		if (!this.rid) {
			return null;
		}
		if (!joined && !this.tmid) {
			return (
				<View style={styles.joinRoomContainer} key='room-view-join' testID='room-view-join'>
					<Text accessibilityLabel={I18n.t('You_are_in_preview_mode')} style={[styles.previewMode, { color: themes[theme].titleText }]}>{I18n.t('You_are_in_preview_mode')}</Text>
					<Touch
						onPress={this.joinRoom}
						style={[styles.joinRoomButton, { backgroundColor: themes[theme].actionTintColor }]}
						theme={theme}
					>
						<Text style={[styles.joinRoomText, { color: themes[theme].buttonText }]} testID='room-view-join-button'>{I18n.t(this.isOmnichannel ? 'Take_it' : 'Join')}</Text>
					</Touch>
				</View>
			);
		}
		if (readOnly) {
			return (
				<View style={styles.readOnly}>
					<Text style={[styles.previewMode, { color: themes[theme].titleText }]} accessibilityLabel={I18n.t('This_room_is_read_only')}>{I18n.t('This_room_is_read_only')}</Text>
				</View>
			);
		}
		return (
			<MessageBox
				user={user}
				ref={this.messagebox}
				onSubmit={this.sendMessage}
				rid={this.rid}
				tmid={this.tmid}
				roomType={room.t}
				isFocused={navigation.isFocused}
				theme={theme}
				message={selectedMessage}
				editing={editing}
				editRequest={this.onEditRequest}
				editCancel={this.onEditCancel}
				replying={replying}
				threadsEnabled={true}
				replyWithMention={replyWithMention}
				replyCancel={this.onReplyCancel}
				getCustomEmoji={this.getCustomEmoji}
				navigation={navigation}
			/>
		);
	};



	render() {
		console.count(`${this.constructor.name}.render calls`);
		const {
			room, reactionsModalVisible, selectedMessage, loading, reacting, showingBlockingLoader
		} = this.state;
		const {
			user, baseUrl, theme, navigation, Hide_System_Messages, width, height
		} = this.props;
		const {
			rid, t, sysMes, bannerClosed, announcement
		} = room;

		return (
			<SafeAreaView
				style={{ backgroundColor: themes[theme].backgroundColor }}
				testID='room-view'
			>
				<StatusBar />

				<List
					ref={this.list}
					listRef={this.flatList}
					rid={rid}
					t={t}
					tmid={this.tmid}
					theme={theme}
					tunread={room?.tunread}
					ignored={room?.ignored}
					renderRow={this.renderItem}
					loading={loading}
					navigation={navigation}
					hideSystemMessages={Array.isArray(sysMes) ? sysMes : Hide_System_Messages}
					showMessageInMainThread={false}
				/>
				{this.renderFooter()}
				{this.renderActions()}

				{/* <Loading visible={showingBlockingLoader} /> */}
			</SafeAreaView>
		);
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

export default connect(mapStateToProps, mapDispatchToProps)(withDimensions(withTheme(withSafeAreaInsets(RoomView))));
