import React from 'react';
import { I18nManager, TouchableOpacity, View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Image } from 'react-native-elements';

import { ThemeContext } from '../theme';
import {
	defaultHeader, themedHeader, ModalAnimation, StackAnimation
} from '../utils/navigation';
import Sidebar from '../views/SidebarView';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView, useSafeAreaInsets, useSafeAreaFrame } from 'react-native-safe-area-context';

// Chats Stack
import RoomView from '../views/RoomView';
import RoomsListView from '../views/RoomsListView';
import RoomActionsView from '../views/RoomActionsView';
import RoomInfoView from '../views/RoomInfoView';
import RoomInfoEditView from '../views/RoomInfoEditView';
import RoomMembersView from '../views/RoomMembersView';
import SearchMessagesView from '../views/SearchMessagesView';
import SelectedUsersView from '../views/SelectedUsersView';
import InviteUsersView from '../views/InviteUsersView';
import InviteUsersEditView from '../views/InviteUsersEditView';
import MessagesView from '../views/MessagesView';
import AutoTranslateView from '../views/AutoTranslateView';
import DirectoryView from '../views/DirectoryView';
import NotificationPrefView from '../views/NotificationPreferencesView';
import VisitorNavigationView from '../views/VisitorNavigationView';
import ForwardLivechatView from '../views/ForwardLivechatView';
import LivechatEditView from '../views/LivechatEditView';
import PickerView from '../views/PickerView';
import ThreadMessagesView from '../views/ThreadMessagesView';
import TeamChannelsView from '../views/TeamChannelsView';
import MarkdownTableView from '../views/MarkdownTableView';
import ReadReceiptsView from '../views/ReadReceiptView';
import { themes } from '../constants/colors';

// Profile Stack
import ProfileView from '../views/ProfileView';
import UserPreferencesView from '../views/UserPreferencesView';
import UserNotificationPrefView from '../views/UserNotificationPreferencesView';

// Settings Stack
import SettingsView from '../views/SettingsView';
import SecurityPrivacyView from '../views/SecurityPrivacyView';
import E2EEncryptionSecurityView from '../views/E2EEncryptionSecurityView';
import LanguageView from '../views/LanguageView';
import ThemeView from '../views/ThemeView';
import DefaultBrowserView from '../views/DefaultBrowserView';
import ScreenLockConfigView from '../views/ScreenLockConfigView';

// Admin Stack
import AdminPanelView from '../views/AdminPanelView';

// NewMessage Stack
import NewMessageView from '../views/NewMessageView';
import CreateChannelView from '../views/CreateChannelView';

// E2ESaveYourPassword Stack
import E2ESaveYourPasswordView from '../views/E2ESaveYourPasswordView';
import E2EHowItWorksView from '../views/E2EHowItWorksView';

// E2EEnterYourPassword Stack
import E2EEnterYourPasswordView from '../views/E2EEnterYourPasswordView';

// InsideStackNavigator
import AttachmentView from '../views/AttachmentView';
import ModalBlockView from '../views/ModalBlockView';
import JitsiMeetView from '../views/JitsiMeetView';
import StatusView from '../views/StatusView';
import ShareView from '../views/ShareView';
import CreateDiscussionView from '../views/CreateDiscussionView';

import QueueListView from '../ee/omnichannel/views/QueueListView';
import AddChannelTeamView from '../views/AddChannelTeamView';
import AddExistingChannelView from '../views/AddExistingChannelView';
import SelectListView from '../views/SelectListView';
import FeedsListView from "../imports/Feeds/View/FeedsListView";
import FeedsSearchView from "../imports/Feeds/View/FeedsSearchView";
import FeedsStoriesView from "../imports/Feeds/View/FeedsStoriesView";
import FeedsRoomView from "../imports/Feeds/View/FeedsRoomView";
import FeedsVideoRoomView from "../imports/Feeds/View/FeedsVideoRoomView";

import FeedsUserView from "../imports/Feeds/View/FeedsUserView";
import FeedsPublishView from "../imports/Feeds/View/FeedsPublishView";
import FeedsUnSubscribeView from "../imports/Feeds/View/FeedsUnSubscribeView";

import ImageMap from "../imports/Feeds/images"

const Tab = createBottomTabNavigator();

// ChatsStackNavigator
const {
	homeTab,
	homeActiveTab,
	discoverTab,
	discoverActiveTab,
	shootTab,
	messageTab,
	messageActiveTab,
	userCenterTab,
	userCenterActiveTab,
} = ImageMap;

const TAB_ICON_MAP = {
	FeedsListView: {
		false: homeTab,
		true: homeActiveTab,

	},
	Discover: {
		false: discoverTab,
		true: discoverActiveTab,
	},
	Shoot: {
		false: shootTab,
		true: shootTab,
	},
	RoomsListView: {
		false: messageTab,
		true: messageActiveTab,

	},
	FeedsUserView: {
		false: userCenterTab,
		true: userCenterActiveTab,

	},
};
function MyTabBar({ state, descriptors, navigation }) {
	// const focusedOptions = descriptors[state.routes[state.index].key].options;
	const inset = useSafeAreaInsets();

	return (
		<View
			style={{
				backgroundColor: 'white',

				height: 83,

				shadowColor: 'rgb(153, 153, 153)',
				shadowOffset: {
					width: 0,
					height: 0,
				},
				shadowOpacity: 0.15,
				shadowRadius: 3.84,
				elevation: 5,
			}}>
			<View
				style={{
					height: 55,
					flexDirection: 'row',
					backgroundColor: 'white',

					justifyContent: 'center',
					alignItems: 'center',
					marginBottom: inset.bottom / 2,
				}}>
				{state.routes.map((route, index) => {
					const { options } = descriptors[route.key];
					const label =
						options.tabBarLabel !== undefined
							? options.tabBarLabel
							: options.title !== undefined
								? options.title
								: route.name;

					const isFocused = state.index === index;
					const onPress = () => {
						const event = navigation.emit({
							type: 'tabPress',
							target: route.key,
							canPreventDefault: true,
						});

						if (!isFocused && !event.defaultPrevented) {
							navigation.navigate(route.name);
						}

					};

					const onLongPress = () => {
						navigation.emit({
							type: 'tabLongPress',
							target: route.key,
						});
					};
					const hitItem = TAB_ICON_MAP[route.name];
					let iconName = hitItem[isFocused];

					return (
						<TouchableOpacity
							accessibilityRole="button"
							accessibilityState={isFocused ? { selected: true } : {}}
							accessibilityLabel={options.tabBarAccessibilityLabel}
							testID={options.tabBarTestID}
							onPress={onPress}
							// onLongPress={onLongPress}
							key={index}
							style={{
								flex: 1,
								alignItems: 'center',
								height: '100%',

								justifyContent: 'center',
							}}>
							<View
								style={{
									position: 'relative',
								}}>
								<Image
									resizeMode={'contain'}
									style={{
										width: 20,
										height: 20,
									}}
									placeholderStyle={{
										backgroundColor: 'transparent',
									}}
									source={iconName}
								/>
							</View>
						</TouchableOpacity>
					);
				})}
			</View>
		</View>
	);
}
const IndexPage1 = React.memo(props => {
	return (
		<Tab.Navigator tabBar={props => <MyTabBar {...props} />} backBehavior="none">
			<Tab.Screen
				name="FeedsListView"
				component={FeedsListView}

			/>
			<Tab.Screen
				name="Discover"
				{...FeedsUnSubscribeView}

			/>
			<Tab.Screen
				name="Shoot"
				component={RoomsListView}

			/>
			<Tab.Screen
				name="RoomsListView"
				component={RoomsListView}

			/>
			<Tab.Screen
				name="FeedsUserView"
				{...FeedsUserView}
			/>
		</Tab.Navigator>
	);
});
const ChatsStack = createStackNavigator();
const ChatsStackNavigator = () => {
	const { theme } = React.useContext(ThemeContext);
	return (
		<ChatsStack.Navigator screenOptions={{ ...defaultHeader, ...themedHeader(theme), ...StackAnimation }}>
			{/* <ChatsStack.Screen
				name='FeedsStoriesView'
				component={FeedsStoriesView}
			/> */}
			<ChatsStack.Screen
				name="main"
				component={IndexPage1}
				options={{
					headerShown: false
				}}
			/>
			<ChatsStack.Screen
				name='FeedsListView'

				component={FeedsListView}

			/>
			<ChatsStack.Screen
				name='FeedsUserView'

				{...FeedsUserView}

			/>
			<ChatsStack.Screen
				name='FeedsPublishView'
				{...FeedsPublishView}

			/>
			<ChatsStack.Screen
				name='RoomsListView'
				component={RoomsListView}
			/>

			<ChatsStack.Screen
				name='FeedsRoomView'
				component={FeedsRoomView}
			/>
			<ChatsStack.Screen
				name='FeedsVideoRoomView'
				component={FeedsVideoRoomView}
			/>
			<ChatsStack.Screen
				name='FeedsSearchView'
				{...FeedsSearchView}
			/>
			<ChatsStack.Screen
				name='RoomView'
				component={RoomView}
			/>
			<ChatsStack.Screen
				name='RoomActionsView'
				component={RoomActionsView}
				options={RoomActionsView.navigationOptions}
			/>
			<ChatsStack.Screen
				name='SelectListView'
				component={SelectListView}
				options={SelectListView.navigationOptions}
			/>
			<ChatsStack.Screen
				name='RoomInfoView'
				component={RoomInfoView}
				options={RoomInfoView.navigationOptions}
			/>
			<ChatsStack.Screen
				name='RoomInfoEditView'
				component={RoomInfoEditView}
				options={RoomInfoEditView.navigationOptions}
			/>
			<ChatsStack.Screen
				name='RoomMembersView'
				component={RoomMembersView}
				options={RoomMembersView.navigationOptions}
			/>
			<ChatsStack.Screen
				name='SearchMessagesView'
				component={SearchMessagesView}
				options={SearchMessagesView.navigationOptions}
			/>
			<ChatsStack.Screen
				name='SelectedUsersView'
				component={SelectedUsersView}
			/>
			<ChatsStack.Screen
				name='InviteUsersView'
				component={InviteUsersView}
				options={InviteUsersView.navigationOptions}
			/>
			<ChatsStack.Screen
				name='InviteUsersEditView'
				component={InviteUsersEditView}
				options={InviteUsersEditView.navigationOptions}
			/>
			<ChatsStack.Screen
				name='MessagesView'
				component={MessagesView}
			/>
			<ChatsStack.Screen
				name='AutoTranslateView'
				component={AutoTranslateView}
				options={AutoTranslateView.navigationOptions}
			/>
			<ChatsStack.Screen
				name='DirectoryView'
				component={DirectoryView}
				options={DirectoryView.navigationOptions}
			/>
			<ChatsStack.Screen
				name='NotificationPrefView'
				component={NotificationPrefView}
				options={NotificationPrefView.navigationOptions}
			/>
			<ChatsStack.Screen
				name='VisitorNavigationView'
				component={VisitorNavigationView}
				options={VisitorNavigationView.navigationOptions}
			/>
			<ChatsStack.Screen
				name='ForwardLivechatView'
				component={ForwardLivechatView}
				options={ForwardLivechatView.navigationOptions}
			/>
			<ChatsStack.Screen
				name='LivechatEditView'
				component={LivechatEditView}
				options={LivechatEditView.navigationOptions}
			/>
			<ChatsStack.Screen
				name='PickerView'
				component={PickerView}
				options={PickerView.navigationOptions}
			/>
			<ChatsStack.Screen
				name='ThreadMessagesView'
				component={ThreadMessagesView}
				options={ThreadMessagesView.navigationOptions}
			/>
			<ChatsStack.Screen
				name='TeamChannelsView'
				component={TeamChannelsView}
				options={TeamChannelsView.navigationOptions}
			/>
			<ChatsStack.Screen
				name='CreateChannelView'
				component={CreateChannelView}
				options={CreateChannelView.navigationOptions}
			/>
			<ChatsStack.Screen
				name='AddChannelTeamView'
				component={AddChannelTeamView}
				options={AddChannelTeamView.navigationOptions}
			/>
			<ChatsStack.Screen
				name='AddExistingChannelView'
				component={AddExistingChannelView}
				options={AddExistingChannelView.navigationOptions}
			/>
			<ChatsStack.Screen
				name='MarkdownTableView'
				component={MarkdownTableView}
				options={MarkdownTableView.navigationOptions}
			/>
			<ChatsStack.Screen
				name='ReadReceiptsView'
				component={ReadReceiptsView}
				options={ReadReceiptsView.navigationOptions}
			/>
			<ChatsStack.Screen
				name='QueueListView'
				component={QueueListView}
				options={QueueListView.navigationOptions}
			/>
		</ChatsStack.Navigator>
	);
};

// ProfileStackNavigator
const ProfileStack = createStackNavigator();
const ProfileStackNavigator = () => {
	const { theme } = React.useContext(ThemeContext);
	return (
		<ProfileStack.Navigator screenOptions={{ ...defaultHeader, ...themedHeader(theme), ...StackAnimation }}>
			<ProfileStack.Screen
				name='ProfileView'
				component={ProfileView}
				options={ProfileView.navigationOptions}
			/>
			<ProfileStack.Screen
				name='UserPreferencesView'
				component={UserPreferencesView}
				options={UserPreferencesView.navigationOptions}
			/>
			<ProfileStack.Screen
				name='UserNotificationPrefView'
				component={UserNotificationPrefView}
				options={UserNotificationPrefView.navigationOptions}
			/>
			<ProfileStack.Screen
				name='PickerView'
				component={PickerView}
				options={PickerView.navigationOptions}
			/>
		</ProfileStack.Navigator>
	);
};

// SettingsStackNavigator
const SettingsStack = createStackNavigator();
const SettingsStackNavigator = () => {
	const { theme } = React.useContext(ThemeContext);

	return (
		<SettingsStack.Navigator screenOptions={{ ...defaultHeader, ...themedHeader(theme), ...StackAnimation }}>
			<SettingsStack.Screen
				name='SettingsView'
				component={SettingsView}
				options={SettingsView.navigationOptions}
			/>
			<SettingsStack.Screen
				name='SecurityPrivacyView'
				component={SecurityPrivacyView}
				options={SecurityPrivacyView.navigationOptions}
			/>
			<SettingsStack.Screen
				name='E2EEncryptionSecurityView'
				component={E2EEncryptionSecurityView}
				options={E2EEncryptionSecurityView.navigationOptions}
			/>
			<SettingsStack.Screen
				name='LanguageView'
				component={LanguageView}
				options={LanguageView.navigationOptions}
			/>
			<SettingsStack.Screen
				name='ThemeView'
				component={ThemeView}
				options={ThemeView.navigationOptions}
			/>
			<SettingsStack.Screen
				name='DefaultBrowserView'
				component={DefaultBrowserView}
				options={DefaultBrowserView.navigationOptions}
			/>
			<SettingsStack.Screen
				name='ScreenLockConfigView'
				component={ScreenLockConfigView}
				options={ScreenLockConfigView.navigationOptions}
			/>
		</SettingsStack.Navigator>
	);
};

// AdminPanelStackNavigator
const AdminPanelStack = createStackNavigator();
const AdminPanelStackNavigator = () => {
	const { theme } = React.useContext(ThemeContext);

	return (
		<AdminPanelStack.Navigator screenOptions={{ ...defaultHeader, ...themedHeader(theme), ...StackAnimation }}>
			<AdminPanelStack.Screen
				name='AdminPanelView'
				component={AdminPanelView}
				options={AdminPanelView.navigationOptions}
			/>
		</AdminPanelStack.Navigator>
	);
};

// DrawerNavigator
const Drawer = createDrawerNavigator();
const DrawerNavigator = () => {
	const { theme } = React.useContext(ThemeContext);

	return (
		<Drawer.Navigator
			drawerContent={({ navigation, state }) => <Sidebar navigation={navigation} state={state} />}
			drawerPosition={I18nManager.isRTL ? 'right' : 'left'}
			screenOptions={{ swipeEnabled: false, headerShown: false }}
			drawerType='back'
			overlayColor={`rgba(0,0,0,${themes[theme].backdropOpacity})`}
		>
			<Drawer.Screen name='ChatsStackNavigator' component={ChatsStackNavigator} />
			<Drawer.Screen name='ProfileStackNavigator' component={ProfileStackNavigator} />
			<Drawer.Screen name='SettingsStackNavigator' component={SettingsStackNavigator} />
			<Drawer.Screen name='AdminPanelStackNavigator' component={AdminPanelStackNavigator} />
		</Drawer.Navigator>
	);
};

// NewMessageStackNavigator
const NewMessageStack = createStackNavigator();
const NewMessageStackNavigator = () => {
	const { theme } = React.useContext(ThemeContext);

	return (
		<NewMessageStack.Navigator screenOptions={{ ...defaultHeader, ...themedHeader(theme), ...StackAnimation }}>
			<NewMessageStack.Screen
				name='NewMessageView'
				component={NewMessageView}
				options={NewMessageView.navigationOptions}
			/>
			<NewMessageStack.Screen
				name='SelectedUsersViewCreateChannel'
				component={SelectedUsersView}
			/>
			<NewMessageStack.Screen
				name='CreateChannelView'
				component={CreateChannelView}
				options={CreateChannelView.navigationOptions}
			/>
			<NewMessageStack.Screen
				name='CreateDiscussionView'
				component={CreateDiscussionView}
			/>
		</NewMessageStack.Navigator>
	);
};

// E2ESaveYourPasswordStackNavigator
const E2ESaveYourPasswordStack = createStackNavigator();
const E2ESaveYourPasswordStackNavigator = () => {
	const { theme } = React.useContext(ThemeContext);

	return (
		<E2ESaveYourPasswordStack.Navigator screenOptions={{ ...defaultHeader, ...themedHeader(theme), ...StackAnimation }}>
			<E2ESaveYourPasswordStack.Screen
				name='E2ESaveYourPasswordView'
				component={E2ESaveYourPasswordView}
				options={E2ESaveYourPasswordView.navigationOptions}
			/>
			<E2ESaveYourPasswordStack.Screen
				name='E2EHowItWorksView'
				component={E2EHowItWorksView}
				options={E2EHowItWorksView.navigationOptions}
			/>
		</E2ESaveYourPasswordStack.Navigator>
	);
};

// E2EEnterYourPasswordStackNavigator
const E2EEnterYourPasswordStack = createStackNavigator();
const E2EEnterYourPasswordStackNavigator = () => {
	const { theme } = React.useContext(ThemeContext);

	return (
		<E2EEnterYourPasswordStack.Navigator screenOptions={{ ...defaultHeader, ...themedHeader(theme), ...StackAnimation }}>
			<E2EEnterYourPasswordStack.Screen
				name='E2EEnterYourPasswordView'
				component={E2EEnterYourPasswordView}
				options={E2EEnterYourPasswordView.navigationOptions}
			/>
		</E2EEnterYourPasswordStack.Navigator>
	);
};

// InsideStackNavigator
const InsideStack = createStackNavigator();
const InsideStackNavigator = () => {
	const { theme } = React.useContext(ThemeContext);

	return (
		<InsideStack.Navigator mode='modal' screenOptions={{ ...defaultHeader, ...themedHeader(theme), ...ModalAnimation }}>
			<InsideStack.Screen
				name='DrawerNavigator'
				component={DrawerNavigator}
				options={{ headerShown: false }}
			/>
			<InsideStack.Screen
				name='NewMessageStackNavigator'
				component={NewMessageStackNavigator}
				options={{ headerShown: false }}
			/>
			<InsideStack.Screen
				name='E2ESaveYourPasswordStackNavigator'
				component={E2ESaveYourPasswordStackNavigator}
				options={{ headerShown: false }}
			/>
			<InsideStack.Screen
				name='E2EEnterYourPasswordStackNavigator'
				component={E2EEnterYourPasswordStackNavigator}
				options={{ headerShown: false }}
			/>
			<InsideStack.Screen
				name='AttachmentView'
				component={AttachmentView}
			/>
			<InsideStack.Screen
				name='StatusView'
				component={StatusView}
			/>
			<InsideStack.Screen
				name='ShareView'
				component={ShareView}
			/>
			<InsideStack.Screen
				name='ModalBlockView'
				component={ModalBlockView}
				options={ModalBlockView.navigationOptions}
			/>
			<InsideStack.Screen
				name='JitsiMeetView'
				component={JitsiMeetView}
				options={{ headerShown: false }}
			/>
		</InsideStack.Navigator>
	);
};

export default InsideStackNavigator;
