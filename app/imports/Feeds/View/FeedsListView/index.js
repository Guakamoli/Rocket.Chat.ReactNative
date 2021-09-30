import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
	View,
	FlatList,
	BackHandler,
	Text,
	Keyboard,
	Modal,
	RefreshControl,
	Dimensions,
} from 'react-native';
import { connect } from 'react-redux';
import { dequal } from 'dequal';
import Orientation from 'react-native-orientation-locker';
import { Q } from '@nozbe/watermelondb';
import { withSafeAreaInsets } from 'react-native-safe-area-context';
import RoomServices from "../../../../views/RoomView/services/index"
import database from '../../../../lib/database';
import RocketChat from '../../../../lib/rocketchat';
import RoomItem, { ROW_HEIGHT } from '../../../../presentation/RoomItem';
import styles from './styles';
import log, { logEvent, events } from '../../../../utils/log';
import I18n from '../../../../i18n';
import {
	toggleSortDropdown as toggleSortDropdownAction,
	openSearchHeader as openSearchHeaderAction,
	closeSearchHeader as closeSearchHeaderAction,
	roomsRequest as roomsRequestAction,
	closeServerDropdown as closeServerDropdownAction
} from '../../../../actions/rooms';
import debounce from '../../../../utils/debounce';
import { isIOS, isTablet } from '../../../../utils/deviceInfo';
import * as HeaderButton from '../../../../containers/HeaderButton';
import StatusBar from '../../../../containers/StatusBar';
import ActivityIndicator from '../../../../containers/ActivityIndicator';
import { selectServerRequest as selectServerRequestAction } from '../../../../actions/server';
import { animateNextTransition } from '../../../../utils/layoutAnimation';
import { withTheme } from '../../../../theme';
import { themes } from '../../../../constants/colors';
import EventEmitter from '../../../../utils/events';
import ChannelCircle from "./ChannelCircle"
import {
	KEY_COMMAND,
	handleCommandShowPreferences,
	handleCommandSearching,
	handleCommandSelectRoom,
	handleCommandPreviousRoom,
	handleCommandNextRoom,
	handleCommandShowNewMessage,
	handleCommandAddNewServer
} from '../../../../commands';
import { MAX_SIDEBAR_WIDTH } from '../../../../constants/tablet';
import { getUserSelector } from '../../../../selectors/login';
import { goRoom } from '../../../../utils/goRoom';
import SafeAreaView from '../../../../containers/SafeAreaView';
import Header, { getHeaderTitlePosition } from '../../../../containers/Header';
import { withDimensions } from '../../../../dimensions';
import { showErrorAlert, showConfirmationAlert } from '../../../../utils/info';
import { E2E_BANNER_TYPE } from '../../../../lib/encryption/constants';

import { getInquiryQueueSelector } from '../../../../ee/omnichannel/selectors/inquiry';
import { changeLivechatStatus, isOmnichannelStatusAvailable } from '../../../../ee/omnichannel/lib';
import FeedsItem from "./Item"
import { Image, Avatar } from "react-native-elements"
import ImageMap from "../../images"
import { lessThan } from 'react-native-reanimated';
import { formatAttachmentUrl } from '../../../../lib/utils.js';
import CubeNavigationHorizontal from '../FeedsStoriesView/cubicTransForm';
import AllStories from '../FeedsStoriesView/constants/AllStories';
import StoryContainer from '../FeedsStoriesView/components/StoryContainer';
const { searchPng, companyTitlePng } = ImageMap
const INITIAL_NUM_TO_RENDER = isTablet ? 20 : 12;
const CHATS_HEADER = 'Chats';
const UNREAD_HEADER = 'Unread';
const FAVORITES_HEADER = 'Favorites';
const DISCUSSIONS_HEADER = 'Discussions';
const TEAMS_HEADER = 'Teams';
const CHANNELS_HEADER = 'Channels';
const DM_HEADER = 'Direct_Messages';
const OMNICHANNEL_HEADER = 'Open_Livechats';
const QUERY_SIZE = 20;

const filterIsUnread = s => (s.unread > 0 || s.tunread?.length > 0 || s.alert) && !s.hideUnreadStatus;
const filterIsFavorite = s => s.f;
const filterIsOmnichannel = s => s.t === 'l';
const filterIsTeam = s => s.teamMain;
const filterIsDiscussion = s => s.prid;
const { width, height } = Dimensions.get('window');

const shouldUpdateProps = [
	'searchText',
	'loadingServer',
	'showServerDropdown',
	'showSortDropdown',
	'sortBy',
	'groupByType',
	'showFavorites',
	'showUnread',
	'useRealName',
	'StoreLastMessage',
	'theme',
	'isMasterDetail',
	'refreshing',
	'queueSize',
	'inquiryEnabled',
	'encryptionBanner'
];
const getItemLayout = (data, index) => ({
	length: ROW_HEIGHT,
	offset: ROW_HEIGHT * index,
	index
});
const keyExtractor = item => item.id;

class RoomsListView extends React.Component {
	static propTypes = {
		navigation: PropTypes.object,
		user: PropTypes.shape({
			id: PropTypes.string,
			username: PropTypes.string,
			token: PropTypes.string,
			statusLivechat: PropTypes.string,
			roles: PropTypes.object
		}),
		server: PropTypes.string,
		searchText: PropTypes.string,
		changingServer: PropTypes.bool,
		loadingServer: PropTypes.bool,
		showServerDropdown: PropTypes.bool,
		showSortDropdown: PropTypes.bool,
		sortBy: PropTypes.string,
		groupByType: PropTypes.bool,
		showFavorites: PropTypes.bool,
		showUnread: PropTypes.bool,
		refreshing: PropTypes.bool,
		StoreLastMessage: PropTypes.bool,
		theme: PropTypes.string,
		toggleSortDropdown: PropTypes.func,
		openSearchHeader: PropTypes.func,
		closeSearchHeader: PropTypes.func,
		appStart: PropTypes.func,
		roomsRequest: PropTypes.func,
		closeServerDropdown: PropTypes.func,
		useRealName: PropTypes.bool,
		isMasterDetail: PropTypes.bool,
		rooms: PropTypes.array,
		width: PropTypes.number,
		insets: PropTypes.object,
		queueSize: PropTypes.number,
		inquiryEnabled: PropTypes.bool,
		encryptionBanner: PropTypes.string
	};

	constructor(props) {
		super(props);
		console.time(`${this.constructor.name} init`);
		console.time(`${this.constructor.name} mount`);

		this.animated = false;
		this.mounted = false;
		this.count = 0;
		this.urlMap = {}
		this.retryFindCount = 0
		this.hadGetNewMessage = false;
		this.channelsDataIds = []
		this.state = {
			searching: false,
			search: [],
			loading: true,
			chatsUpdate: [],
			chats: [],
			messages: [],
			item: {}
		};
		this.viewabilityConfigCallbackPairs = [{
			viewabilityConfig: {
				minimumViewTime: 500,
				itemVisiblePercentThreshold: 100
			},
			onViewableItemsChanged: this.handleItemsInViewPort
		},
		{
			viewabilityConfig: {
				minimumViewTime: 150,
				itemVisiblePercentThreshold: 10
			},
			onViewableItemsChanged: this.handleItemsPartiallyVisible
		}
		];
		this.setHeader();
		setTimeout(() => {
			this.getSubscriptions();

		}, 1000)
	}
	handleItemsInViewPort(a, b) {
		console.log(a, b, '222')
	}
	handleItemsPartiallyVisible(a, b) {
		console.log(a, b, '3333')

	}
	componentDidMount() {
		const {
			navigation, closeServerDropdown
		} = this.props;
		this.mounted = true;

		if (isTablet) {
			EventEmitter.addEventListener(KEY_COMMAND, this.handleCommands);
		}
		this.unsubscribeFocus = navigation.addListener('focus', () => {
			Orientation.unlockAllOrientations();
			this.animated = true;
			// Check if there were changes while not focused (it's set on sCU)
			if (this.shouldUpdate) {
				this.forceUpdate();
				this.shouldUpdate = false;
			}
			this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
		});
		this.unsubscribeBlur = navigation.addListener('blur', () => {
			this.animated = false;
			closeServerDropdown();
			this.cancelSearch();
			if (this.backHandler && this.backHandler.remove) {
				this.backHandler.remove();
			}
		});
		console.timeEnd(`${this.constructor.name} mount`);
	}

	UNSAFE_componentWillReceiveProps(nextProps) {
		const {
			loadingServer, searchText, server, changingServer
		} = this.props;

		// when the server is changed
		if (server !== nextProps.server && loadingServer !== nextProps.loadingServer && nextProps.loadingServer) {
			this.setState({ loading: true });
		}
		// when the server is changing and stopped loading
		if (changingServer && loadingServer !== nextProps.loadingServer && !nextProps.loadingServer) {
			this.getSubscriptions();
		}
		if (searchText !== nextProps.searchText) {
			this.search(nextProps.searchText);
		}
	}

	shouldComponentUpdate(nextProps, nextState) {
		const { chatsUpdate, searching, item } = this.state;
		// eslint-disable-next-line react/destructuring-assignment
		const propsUpdated = shouldUpdateProps.some(key => nextProps[key] !== this.props[key]);
		if (propsUpdated) {
			return true;
		}

		// Compare changes only once
		const chatsNotEqual = !dequal(nextState.chatsUpdate, chatsUpdate);

		// If they aren't equal, set to update if focused
		if (chatsNotEqual) {
			this.shouldUpdate = true;
		}

		if (nextState.searching !== searching) {
			return true;
		}

		if (nextState.item?.rid !== item?.rid) {
			return true;
		}

		// Abort if it's not focused
		if (!nextProps.navigation.isFocused()) {
			return false;
		}

		const {
			loading,
			search
		} = this.state;
		const { rooms, width, insets } = this.props;
		if (nextState.loading !== loading) {
			return true;
		}
		if (nextProps.width !== width) {
			return true;
		}
		if (!dequal(nextState.search, search)) {
			return true;
		}
		if (!dequal(nextProps.rooms, rooms)) {
			return true;
		}
		if (!dequal(nextProps.insets, insets)) {
			return true;
		}
		// If it's focused and there are changes, update
		if (chatsNotEqual) {
			this.shouldUpdate = false;
			return true;
		}
		return false;
	}

	componentDidUpdate(prevProps) {
		const {
			sortBy,
			groupByType,
			showFavorites,
			showUnread,
			rooms,
			isMasterDetail,
			insets
		} = this.props;
		const { item } = this.state;

		if (
			!(
				prevProps.sortBy === sortBy
				&& prevProps.groupByType === groupByType
				&& prevProps.showFavorites === showFavorites
				&& prevProps.showUnread === showUnread
			)
		) {
			this.getSubscriptions();
		}
		// Update current item in case of another action triggers an update on rooms reducer
		if (isMasterDetail && item?.rid !== rooms[0] && !dequal(rooms, prevProps.rooms)) {
			// eslint-disable-next-line react/no-did-update-set-state
			this.setState({ item: { rid: rooms[0] } });
		}
		if (insets.left !== prevProps.insets.left || insets.right !== prevProps.insets.right) {
			this.setHeader();
		}
	}

	componentWillUnmount() {
		this.unsubscribeQuery();
		if (this.unsubscribeFocus) {
			this.unsubscribeFocus();
		}
		if (this.unsubscribeBlur) {
			this.unsubscribeBlur();
		}
		this.unsubscribeMessages()
		if (this.backHandler && this.backHandler.remove) {
			this.backHandler.remove();
		}
		if (isTablet) {
			EventEmitter.removeListener(KEY_COMMAND, this.handleCommands);
		}
		console.countReset(`${this.constructor.name}.render calls`);
	}

	getHeader = () => {
		const { searching } = this.state;
		const { navigation, isMasterDetail, insets } = this.props;
		const headerTitlePosition = getHeaderTitlePosition({ insets, numIconsRight: searching ? 0 : 3 });
		return {
			headerLeft: () => (
				<Image source={companyTitlePng}
					style={styles.companyTitlePng} resizeMode={'contain'}
					placeholderStyle={{ backgroundColor: "transparent" }} />
			),
			headerStyle: {
				backgroundColor: "white"
			},
			headerLeftContainerStyle: { paddingLeft: 15 },
			headerRightContainerStyle: { paddingRight: 15 },
			headerTitle: () => null,
			headerCenter: () => null,
			headerRight: () => (
				<Image source={searchPng} style={styles.searchPng} resizeMode={'contain'}
					placeholderStyle={{ backgroundColor: "transparent" }}
					onPress={this.toSearchView} />)
		};
	}
	toSearchView = () => {
		const { navigation } = this.props;
		navigation.navigate("RoomsListView")
		return
		navigation.navigate("FeedsSearchView" || "RoomsListView")
	}
	setHeader = () => {
		const { navigation } = this.props;
		const options = this.getHeader();
		navigation.setOptions(options);
	}

	internalSetState = (...args) => {
		if (this.animated) {
			animateNextTransition();
		}
		this.setState(...args);
	};

	addRoomsGroup = (data, header, allData) => {
		if (data.length > 0) {
			if (header) {
				allData.push({ rid: header, separator: true });
			}
			allData = allData.concat(data);
		}
		return allData;
	}
	unsubscribeMessages = () => {
		if (this.messagesSubscription && this.messagesSubscription.unsubscribe) {
			this.messagesSubscription.unsubscribe();
		}
	}
	init = async (channelsDataIds) => {
		const initInner = async (channelsDataIds, resolve) => {
			try {
				if (this.hadGetNewMessage) return

				const channelsDataIdsPro = channelsDataIds.map((i) => {
					return RoomServices.getMessages({ rid: i, lastOpen: true })
				})
				await Promise.all(channelsDataIdsPro)
				this.hadGetNewMessage = true
				resolve()
			} catch (e) {
				this.retryFindCount = this.retryFindCount + 1 || 1;
				if (this.retryFindCount <= 10) {
					this.retryFindTimeout = setTimeout(() => {
						console.info("请求", e)
						initInner(channelsDataIds, resolve);
					}, 2000 * this.retryFindCount);
				}
			}

		}
		return new Promise((resolve) => {
			initInner(channelsDataIds, resolve)
		})
	}
	getSubscriptions = async () => {
		this.unsubscribeQuery();

		const {
			sortBy,
			showUnread,
			showFavorites,
			groupByType,
			user
		} = this.props;

		const db = database.active;
		let observable;

		const defaultWhereClause = [
			Q.where('archived', false),
			Q.where('open', true),
			Q.where("t", "c"),
		];

		if (sortBy === 'alphabetical') {
			defaultWhereClause.push(Q.experimentalSortBy(`${this.useRealName ? 'fname' : 'name'}`, Q.asc));
		} else {
			defaultWhereClause.push(Q.experimentalSortBy('room_updated_at', Q.desc));
		}

		// When we're grouping by something
		if (this.isGrouping) {
			observable = await db.collections
				.get('subscriptions')
				.query(...defaultWhereClause)
				.observeWithColumns(['alert']);

			// When we're NOT grouping
		} else {
			this.count += QUERY_SIZE;
			observable = await db.collections
				.get('subscriptions')
				.query(
					...defaultWhereClause,

					Q.experimentalSkip(0),
					Q.experimentalTake(1000)
				)
				.observe();
		}
		let channelsData = await db.collections
			.get('subscriptions')
			.query(
				...defaultWhereClause,

				Q.experimentalSkip(0),
				Q.experimentalTake(1000)
			).fetch()
		const channelsDataIds = channelsData.map((i) => i.rid)
		this.channelsDataIds = channelsDataIds
		const whereClause = [
			Q.where('rid', Q.oneOf(channelsDataIds)),
			Q.where('tmid', null),
			Q.and(
				Q.where('attachments', Q.like(`%"attachments":[]%`)),
				Q.or(
					Q.where('attachments', Q.like(`%image_type%`)),
					Q.where('attachments', Q.like(`%video_type%`))
				)
			),
			Q.experimentalSortBy('ts', Q.desc),
			Q.experimentalTake(50)
		];
		await this.init(channelsDataIds)
		console.info("开始计算")

		// const messages = await db.collections
		// 	.get('messages')
		// 	.query(...whereClause)
		// 	.fetch()
		// this.setState({ messages })

		this.messagesObservable = db.collections
			.get('messages')
			.query(...whereClause)
			.observe();
		this.unsubscribeMessages();
		this.messagesSubscription = this.messagesObservable
			.subscribe((messages) => {

				messages = messages.filter(m => m.attachments[0].attachments[0] === undefined);
				console.info("消息", messages,)
				if (this.mounted) {
					this.setState({ messages }, () => this.update());
				} else {
					this.state.messages = messages;
				}
				// TODO: move it away from here
				// this.readThreads();
			});
		this.querySubscription = observable.subscribe((data) => {
			let tempChats = [];
			// console.info(data, "daaratatat")
			let chats = data;
			let chatsUpdate = [];
			if (showUnread) {
				/**
				 * If unread on top, we trigger re-render based on order changes and sub.alert
				 * RoomItem handles its own re-render
				 */
				chatsUpdate = data.map(item => ({ rid: item.rid, alert: item.alert }));
			} else {
				/**
				 * Otherwise, we trigger re-render only when chats order changes
				 * RoomItem handles its own re-render
				 */
				chatsUpdate = data.map(item => item.rid);
			}

			const isOmnichannelAgent = user?.roles?.includes('livechat-agent');
			if (isOmnichannelAgent) {
				const omnichannel = chats.filter(s => filterIsOmnichannel(s));
				chats = chats.filter(s => !filterIsOmnichannel(s));
				tempChats = this.addRoomsGroup(omnichannel, OMNICHANNEL_HEADER, tempChats);
			}

			// unread
			if (showUnread) {
				const unread = chats.filter(s => filterIsUnread(s));
				chats = chats.filter(s => !filterIsUnread(s));
				tempChats = this.addRoomsGroup(unread, UNREAD_HEADER, tempChats);
			}

			// favorites
			if (showFavorites) {
				const favorites = chats.filter(s => filterIsFavorite(s));
				chats = chats.filter(s => !filterIsFavorite(s));
				tempChats = this.addRoomsGroup(favorites, FAVORITES_HEADER, tempChats);
			}

			// type
			if (groupByType) {
				const teams = chats.filter(s => filterIsTeam(s));
				const discussions = chats.filter(s => filterIsDiscussion(s));
				const channels = chats.filter(s => (s.t === 'c' || s.t === 'p') && !filterIsDiscussion(s) && !filterIsTeam(s));
				const direct = chats.filter(s => s.t === 'd' && !filterIsDiscussion(s) && !filterIsTeam(s));
				tempChats = this.addRoomsGroup(teams, TEAMS_HEADER, tempChats);
				tempChats = this.addRoomsGroup(discussions, DISCUSSIONS_HEADER, tempChats);
				tempChats = this.addRoomsGroup(channels, CHANNELS_HEADER, tempChats);
				tempChats = this.addRoomsGroup(direct, DM_HEADER, tempChats);
			} else if (showUnread || showFavorites || isOmnichannelAgent) {
				tempChats = this.addRoomsGroup(chats, CHATS_HEADER, tempChats);
			} else {
				tempChats = chats;
			}

			if (this.mounted) {
				this.internalSetState({
					chats: tempChats,
					chatsUpdate,
					loading: false
				});
			} else {
				this.state.chats = tempChats;
				this.state.chatsUpdate = chatsUpdate;
				this.state.loading = false;
			}

		});
	}
	update = () => {
		if (this.animated) {
			animateNextTransition();
		}
		this.forceUpdate();
	};
	unsubscribeQuery = () => {
		if (this.querySubscription && this.querySubscription.unsubscribe) {
			this.querySubscription.unsubscribe();
		}
	}

	initSearching = () => {
		logEvent(events.RL_SEARCH);
		const { openSearchHeader } = this.props;
		this.internalSetState({ searching: true }, () => {
			openSearchHeader();
			this.search('');
			this.setHeader();
		});
	};

	cancelSearch = () => {
		const { searching } = this.state;
		const { closeSearchHeader } = this.props;

		if (!searching) {
			return;
		}

		Keyboard.dismiss();

		this.setState({ searching: false, search: [] }, () => {
			this.setHeader();
			closeSearchHeader();
			setTimeout(() => {
				this.scrollToTop();
			}, 200);
		});
	};

	handleBackPress = () => {
		const { searching } = this.state;
		if (searching) {
			this.cancelSearch();
			return true;
		}
		return false;
	};

	// eslint-disable-next-line react/sort-comp
	search = debounce(async (text) => {
		const result = await RocketChat.search({ text });

		// if the search was cancelled before the promise is resolved
		const { searching } = this.state;
		if (!searching) {
			return;
		}
		this.internalSetState({
			search: result,
			searching: true
		});
		this.scrollToTop();
	}, 300);

	getRoomTitle = item => RocketChat.getRoomTitle(item)

	getRoomAvatar = item => RocketChat.getRoomAvatar(item)

	isGroupChat = item => RocketChat.isGroupChat(item)

	isRead = item => RocketChat.isRead(item)

	getUserPresence = uid => RocketChat.getUserPresence(uid)

	getUidDirectMessage = room => RocketChat.getUidDirectMessage(room);

	get isGrouping() {
		const { showUnread, showFavorites, groupByType } = this.props;
		return showUnread || showFavorites || groupByType;
	}

	onPressItem = (item = {}) => {
		const { navigation, isMasterDetail } = this.props;
		if (!navigation.isFocused()) {
			return;
		}

		this.cancelSearch();
		this.goRoom({ item, isMasterDetail });
	};

	scrollToTop = () => {
		if (this.scroll?.scrollToOffset) {
			this.scroll.scrollToOffset({ offset: 0 });
		}
	}

	toggleSort = () => {
		logEvent(events.RL_TOGGLE_SORT_DROPDOWN);
		const { toggleSortDropdown } = this.props;

		this.scrollToTop();
		setTimeout(() => {
			toggleSortDropdown();
		}, 100);
	};

	toggleFav = async (rid, favorite) => {
		logEvent(favorite ? events.RL_UNFAVORITE_CHANNEL : events.RL_FAVORITE_CHANNEL);
		try {
			const db = database.active;
			const result = await RocketChat.toggleFavorite(rid, !favorite);
			if (result.success) {
				const subCollection = db.get('subscriptions');
				await db.action(async () => {
					try {
						const subRecord = await subCollection.find(rid);
						await subRecord.update((sub) => {
							sub.f = !favorite;
						});
					} catch (e) {
						log(e);
					}
				});
			}
		} catch (e) {
			logEvent(events.RL_TOGGLE_FAVORITE_FAIL);
			log(e);
		}
	};

	toggleRead = async (rid, isRead) => {
		logEvent(isRead ? events.RL_UNREAD_CHANNEL : events.RL_READ_CHANNEL);
		try {
			const db = database.active;
			const result = await RocketChat.toggleRead(isRead, rid);

			if (result.success) {
				const subCollection = db.get('subscriptions');
				await db.action(async () => {
					try {
						const subRecord = await subCollection.find(rid);
						await subRecord.update((sub) => {
							sub.alert = isRead;
							sub.unread = 0;
						});
					} catch (e) {
						log(e);
					}
				});
			}
		} catch (e) {
			logEvent(events.RL_TOGGLE_READ_F);
			log(e);
		}
	};

	hideChannel = async (rid, type) => {
		logEvent(events.RL_HIDE_CHANNEL);
		try {
			const db = database.active;
			const result = await RocketChat.hideRoom(rid, type);
			if (result.success) {
				const subCollection = db.get('subscriptions');
				await db.action(async () => {
					try {
						const subRecord = await subCollection.find(rid);
						await subRecord.destroyPermanently();
					} catch (e) {
						log(e);
					}
				});
			}
		} catch (e) {
			logEvent(events.RL_HIDE_CHANNEL_F);
			log(e);
		}
	};

	goDirectory = () => {
		logEvent(events.RL_GO_DIRECTORY);
		const { navigation, isMasterDetail } = this.props;
		if (isMasterDetail) {
			navigation.navigate('ModalStackNavigator', { screen: 'DirectoryView' });
		} else {
			navigation.navigate('DirectoryView');
		}
	};

	goQueue = () => {
		logEvent(events.RL_GO_QUEUE);
		const {
			navigation, isMasterDetail, queueSize, inquiryEnabled, user
		} = this.props;

		// if not-available, prompt to change to available
		if (!isOmnichannelStatusAvailable(user)) {
			showConfirmationAlert({
				message: I18n.t('Omnichannel_enable_alert'),
				confirmationText: I18n.t('Yes'),
				onPress: async () => {
					try {
						await changeLivechatStatus();
					} catch {
						// Do nothing
					}
				}
			});
		}

		if (!inquiryEnabled) {
			return;
		}
		// prevent navigation to empty list
		if (!queueSize) {
			return showErrorAlert(I18n.t('Queue_is_empty'), I18n.t('Oops'));
		}
		if (isMasterDetail) {
			navigation.navigate('ModalStackNavigator', { screen: 'QueueListView' });
		} else {
			navigation.navigate('QueueListView');
		}
	};

	goRoom = ({ item, isMasterDetail }) => {
		logEvent(events.RL_GO_ROOM);
		const { item: currentItem } = this.state;
		const { rooms } = this.props;
		if (currentItem?.rid === item.rid || rooms?.includes(item.rid)) {
			return;
		}
		// Only mark room as focused when in master detail layout
		if (isMasterDetail) {
			this.setState({ item });
		}
		goRoom({ item, isMasterDetail });
	}

	goRoomByIndex = (index) => {
		const { chats } = this.state;
		const { isMasterDetail } = this.props;
		const filteredChats = chats.filter(c => !c.separator);
		const room = filteredChats[index - 1];
		if (room) {
			this.goRoom({ item: room, isMasterDetail });
		}
	}

	findOtherRoom = (index, sign) => {
		const { chats } = this.state;
		const otherIndex = index + sign;
		const otherRoom = chats[otherIndex];
		if (!otherRoom) {
			return;
		}
		if (otherRoom.separator) {
			return this.findOtherRoom(otherIndex, sign);
		} else {
			return otherRoom;
		}
	}

	// Go to previous or next room based on sign (-1 or 1)
	// It's used by iPad key commands
	goOtherRoom = (sign) => {
		const { item } = this.state;
		if (!item) {
			return;
		}

		// Don't run during search
		const { search } = this.state;
		if (search.length > 0) {
			return;
		}

		const { chats } = this.state;
		const { isMasterDetail } = this.props;
		const index = chats.findIndex(c => c.rid === item.rid);
		const otherRoom = this.findOtherRoom(index, sign);
		if (otherRoom) {
			this.goRoom({ item: otherRoom, isMasterDetail });
		}
	}

	goToNewMessage = () => {
		logEvent(events.RL_GO_NEW_MSG);
		const { navigation, isMasterDetail } = this.props;

		if (isMasterDetail) {
			navigation.navigate('ModalStackNavigator', { screen: 'NewMessageView' });
		} else {
			navigation.navigate('NewMessageStackNavigator');
		}
	}

	goEncryption = () => {
		logEvent(events.RL_GO_E2E_SAVE_PASSWORD);
		const { navigation, isMasterDetail, encryptionBanner } = this.props;

		const isSavePassword = encryptionBanner === E2E_BANNER_TYPE.SAVE_PASSWORD;
		if (isMasterDetail) {
			const screen = isSavePassword ? 'E2ESaveYourPasswordView' : 'E2EEnterYourPasswordView';
			navigation.navigate('ModalStackNavigator', { screen });
		} else {
			const screen = isSavePassword ? 'E2ESaveYourPasswordStackNavigator' : 'E2EEnterYourPasswordStackNavigator';
			navigation.navigate(screen);
		}
	}

	handleCommands = ({ event }) => {
		const { navigation, server, isMasterDetail } = this.props;
		const { input } = event;
		if (handleCommandShowPreferences(event)) {
			navigation.navigate('SettingsView');
		} else if (handleCommandSearching(event)) {
			this.initSearching();
		} else if (handleCommandSelectRoom(event)) {
			this.goRoomByIndex(input);
		} else if (handleCommandPreviousRoom(event)) {
			this.goOtherRoom(-1);
		} else if (handleCommandNextRoom(event)) {
			this.goOtherRoom(1);
		} else if (handleCommandShowNewMessage(event)) {
			if (isMasterDetail) {
				navigation.navigate('ModalStackNavigator', { screen: 'NewMessageView' });
			} else {
				navigation.navigate('NewMessageStack');
			}
		} else if (handleCommandAddNewServer(event)) {
			navigation.navigate('NewServerView', { previousServer: server });
		}
	};

	onRefresh = () => {
		const { searching } = this.state;
		const { roomsRequest } = this.props;
		if (searching) {
			return;
		}
		this.init(this.channelsDataIds)
		roomsRequest({ allData: true });
	}

	onEndReached = () => {
		// Run only when we're not grouping by anything
		if (!this.isGrouping) {
			this.getSubscriptions();
		}
	}

	getScrollRef = ref => (this.scroll = ref);

	renderListHeader = () => {
		const { searching, } = this.state;
		const {
			sortBy, queueSize, inquiryEnabled, encryptionBanner, user
		} = this.props;
		const [isModelOpen, setModel] = useState(false);
		const [currentUserIndex, setCurrentUserIndex] = useState(0);
		const currentScrollValue = useRef(0);
		const modalScroll = useRef(null);

		const onStorySelect = (index) => {
			setCurrentUserIndex(index);
			currentScrollValue.current = - (width * index)
			setTimeout(() => {
				setModel(true);

			}, 0);
		};

		const onStoryClose = () => {
			setModel(false);
			currentScrollValue.current = 0
		};

		const onStoryNext = (isScroll) => {
			const newIndex = currentUserIndex + 1;
			currentScrollValue.current -= width
			console.info(AllStories.length, currentScrollValue.current, 'hshsh')
			if (AllStories.length - 1 > currentUserIndex) {
				setCurrentUserIndex(newIndex);
				if (!isScroll) {
					modalScroll.current.scrollTo(newIndex, true);
				}
			} else {
				setModel(false);
			}
		};

		const onStoryPrevious = (isScroll) => {
			const newIndex = currentUserIndex - 1;
			currentScrollValue.current += width
			// currentScrollValue.current = scrollValue

			if (currentUserIndex > 0) {
				setCurrentUserIndex(newIndex);
				if (!isScroll) {
					modalScroll.current.scrollTo(newIndex, true);
				}
			}
		};
		const onScrollChange = (scrollValue) => {
			console.info(currentScrollValue.current, scrollValue)
			if (currentScrollValue.current > scrollValue) {
				onStoryNext(true);
				console.info('next');
				// currentScrollValue.current = scrollValue
			}
			if (currentScrollValue.current < scrollValue) {
				onStoryPrevious();
				console.info('previous');
				// currentScrollValue.current = scrollValue
			}

		};
		return (
			<>
				<ChannelCircle onStorySelect={onStorySelect} />
				<Modal
					animationType="slide"
					transparent={false}
					visible={isModelOpen}
					style={styles.modal}
					onShow={() => {

					}}

					onRequestClose={onStoryClose}
				>
					{/* eslint-disable-next-line max-len */}
					<CubeNavigationHorizontal callBackAfterSwipe={g => onScrollChange(g)} ref={modalScroll} style={styles.container} initialPage={currentUserIndex}>
						{AllStories.map((item, index) => (
							<StoryContainer
								onClose={onStoryClose}
								onStoryNext={onStoryNext}
								onStoryPrevious={onStoryPrevious}
								user={item}
								index={index}
								currentUserIndex={currentUserIndex}
								isNewStory={index !== currentUserIndex}
							/>
						))}
					</CubeNavigationHorizontal>
				</Modal>
			</>
		);
	};

	renderHeader = () => {
		const { isMasterDetail } = this.props;

		if (!isMasterDetail) {
			return null;
		}

		const options = this.getHeader();
		return (
			<Header
				{...options}
			/>
		);
	}

	renderItem = ({ item, index }) => {
		if (item.separator) {
			return this.renderSectionHeader(item.rid);
		}

		const { item: currentItem } = this.state;
		const {
			baseUrl,
			user,
			StoreLastMessage,
			useRealName,
			theme,
			isMasterDetail,
			width

		} = this.props;
		const username = user.username
		const id = this.getUidDirectMessage(item);
		return (
			<FeedsItem
				{...this.props}
				item={item}
				theme={theme}
				id={id}
				baseUrl={baseUrl}
				user={user}
				type={item.t}
				index={index}
				onPress={this.onPressItem}
			/>
		)

	};
	_onViewableItemsChanged = (info, changed) => {
		const {
			baseUrl,
			user,
		} = this.props;
		const attachment = info.viewableItems[0]?.item?.attachments[0]
		if (attachment && attachment.video_url) {
			let url = this.urlMap[attachment.video_url]
			if (!url) {
				url = formatAttachmentUrl(attachment.video_url, user.id, user.token, baseUrl)
				this.urlMap[attachment.video_url] = url
			}
			return EventEmitter.emit('home_video_play', { item: info.viewableItems[0].item, index: info.viewableItems[0].index, url, play: true })
		} else {
			if (info.changed[0]?.isViewable) return
			const changedItem = info.changed[0]?.item

			const attachment = changedItem?.attachments[0]
			if (attachment && attachment.video_url) {
				let url = this.urlMap[attachment.video_url]
				if (!url) {
					url = formatAttachmentUrl(attachment.video_url, user.id, user.token, baseUrl)
					this.urlMap[attachment.video_url] = url
				}
				return EventEmitter.emit('home_video_play', { item: changedItem, index: info.changed[0].index, url, play: false })
			}

		}

	}
	renderSectionHeader = (header) => {
		const { theme } = this.props;
		return (
			<View style={[styles.groupTitleContainer, { backgroundColor: themes[theme].backgroundColor }]}>
				<Text style={[styles.groupTitle, { color: themes[theme].controlText }]}>{I18n.t(header)}</Text>
			</View>
		);
	}
	_viewabilityConfig = {
		waitForInteraction: true,
		// At least one of the viewAreaCoveragePercentThreshold or itemVisiblePercentThreshold is required.
		itemVisiblePercentThreshold: 50,


	};
	renderScroll = () => {
		const {
			loading, chats, search, searching, messages
		} = this.state;
		const { theme, refreshing } = this.props;

		if (loading) {
			return <ActivityIndicator theme={theme} />;
		}

		return (
			<FlatList
				ref={this.getScrollRef}
				data={messages}
				extraData={messages}
				keyExtractor={keyExtractor}
				style={[styles.list, { backgroundColor: themes[theme].backgroundColor }]}
				renderItem={this.renderItem}
				ListHeaderComponent={this.renderListHeader}
				removeClippedSubviews={isIOS}
				keyboardShouldPersistTaps='always'
				onViewableItemsChanged={this._onViewableItemsChanged}
				showsVerticalScrollIndicator={false}
				scrollEventThrottle={16}
				viewabilityConfig={this._viewabilityConfig}
				initialNumToRender={INITIAL_NUM_TO_RENDER}
				// viewabilityConfigCallbackPairs={this.viewabilityConfigCallbackPairs}
				refreshControl={(
					<RefreshControl
						refreshing={refreshing}
						onRefresh={this.onRefresh}
						tintColor={themes[theme].auxiliaryText}
					/>
				)}
				windowSize={9}
				onEndReached={this.onEndReached}
				onEndReachedThreshold={0.5}
			/>
		);
	};

	render = () => {
		console.count(`${this.constructor.name}.render calls`);
		const {
			sortBy,
			groupByType,
			showFavorites,
			showUnread,
			showServerDropdown,
			showSortDropdown,
			theme,
			navigation
		} = this.props;

		return (
			<>
				<SafeAreaView testID='rooms-list-view' style={{ backgroundColor: themes[theme].backgroundColor }}>
					<StatusBar />
					{this.renderHeader()}
					{this.renderScroll()}

				</SafeAreaView>

			</>
		);
	};
}

const mapStateToProps = state => ({
	user: getUserSelector(state),
	isMasterDetail: state.app.isMasterDetail,
	server: state.server.server,
	changingServer: state.server.changingServer,
	searchText: state.rooms.searchText,
	loadingServer: state.server.loading,
	showServerDropdown: state.rooms.showServerDropdown,
	showSortDropdown: state.rooms.showSortDropdown,
	refreshing: state.rooms.refreshing,
	sortBy: state.sortPreferences.sortBy,
	groupByType: state.sortPreferences.groupByType,
	showFavorites: state.sortPreferences.showFavorites,
	showUnread: state.sortPreferences.showUnread,
	useRealName: state.settings.UI_Use_Real_Name,
	StoreLastMessage: state.settings.Store_Last_Message,
	rooms: state.room.rooms,
	baseUrl: state.server.server,
	queueSize: getInquiryQueueSelector(state).length,
	inquiryEnabled: state.inquiry.enabled,
	encryptionBanner: state.encryption.banner
});

const mapDispatchToProps = dispatch => ({
	toggleSortDropdown: () => dispatch(toggleSortDropdownAction()),
	openSearchHeader: () => dispatch(openSearchHeaderAction()),
	closeSearchHeader: () => dispatch(closeSearchHeaderAction()),
	roomsRequest: params => dispatch(roomsRequestAction(params)),
	selectServerRequest: server => dispatch(selectServerRequestAction(server)),
	closeServerDropdown: () => dispatch(closeServerDropdownAction())
});

export default connect(mapStateToProps, mapDispatchToProps)(withDimensions(withTheme(withSafeAreaInsets(RoomsListView))));
