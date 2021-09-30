import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import {
	View, Text, StyleSheet, TouchableOpacity
} from 'react-native';

import { themes } from '../../constants/colors';
import { withTheme } from '../../theme';

import MessageError from './MessageError';
import sharedStyles from '../../views/Styles';
import messageStyles from './styles';
import MessageContext from './Context';
import Content from './Content';
import { formatDateDetail } from "../../utils/room"

import { SYSTEM_MESSAGE_TYPES_WITH_AUTHOR_NAME } from './utils';

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center'
	},
	username: {
		fontSize: 14,
		lineHeight: 17,
		fontWeight: "600",
		color: "#000000FF",
		// backgroundColor: "red"
		// ...sharedStyles.textMedium
	},
	usernameInfoMessage: {
		fontSize: 16,
		...sharedStyles.textMedium
	},
	titleContainer: {
		flexShrink: 1,
		flexDirection: 'row',
		alignItems: 'center'
	},
	alias: {
		fontSize: 14,
		...sharedStyles.textRegular
	}
});
let TimeComp = ({
	isHeader, useRealName, author, alias, ts, timeFormat, hasError, theme, navToRoomInfo, type, ...props
}) => {
	const time = formatDateDetail(ts)

	return (<Text style={[messageStyles.time, { color: themes[theme].auxiliaryText }]}>{time}</Text>)

}
const Aa = () => {
	return <Text style={{
		fontSize: 16,
		lineHeight: 22,
		fontWeight: "500"
	}}></Text>
}
const User = React.memo(props => {
	let {
		isHeader, useRealName, author, alias, ts, timeFormat, hasError, theme, navToRoomInfo, type, ...props1
	} = props
	if (isHeader || hasError || true) {
		const navParam = {
			t: 'd',
			rid: author._id
		};
		const { user } = useContext(MessageContext);
		const username = (useRealName && author.name) || author.username;
		const aliasUsername = alias ? (<Text style={[styles.alias, { color: themes[theme].auxiliaryText }]}> @{username}</Text>) : null;
		const onUserPress = () => navToRoomInfo(navParam);
		const isDisabled = author._id === user.id;

		const textContent = (
			<>
				{alias || username}
				{aliasUsername}
			</>
		);

		if (SYSTEM_MESSAGE_TYPES_WITH_AUTHOR_NAME.includes(type)) {
			return (
				<Text
					style={[styles.usernameInfoMessage, { color: themes[theme].titleText }]}
					onPress={onUserPress}
					disabled={isDisabled}
				>
					{textContent}
				</Text>
			);
		}

		return (
			<View style={styles.container}>
				<TouchableOpacity
					style={styles.titleContainer}
					onPress={onUserPress}
					disabled={isDisabled}
				>
					<Text style={[styles.username, { color: themes[theme].titleText }]}>
						{textContent}
						{/* <Aa /> */}
						{`   `}
						<Content {...props} />
					</Text>
				</TouchableOpacity>
				{/* <Text style={[messageStyles.time, { color: themes[theme].auxiliaryText }]}>{time}</Text> */}
				{ hasError && <MessageError hasError={hasError} theme={theme} {...props1} />}
			</View>
		);
	}
	return null;
});

User.propTypes = {
	isHeader: PropTypes.bool,
	hasError: PropTypes.bool,
	useRealName: PropTypes.bool,
	author: PropTypes.object,
	alias: PropTypes.string,
	ts: PropTypes.instanceOf(Date),
	timeFormat: PropTypes.string,
	theme: PropTypes.string,
	navToRoomInfo: PropTypes.func,
	type: PropTypes.string
};
User.displayName = 'MessageUser';
TimeComp = withTheme(TimeComp)
export { TimeComp }
export default withTheme(User);
