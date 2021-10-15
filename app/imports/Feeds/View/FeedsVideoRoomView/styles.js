import { StyleSheet } from 'react-native';

import sharedStyles from '../../../../views/Styles';

export default StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "black",
	},
	contentContainerStyle: {

	},
	safeAreaView: {
		flex: 1
	},
	readOnly: {
		justifyContent: 'flex-end',
		alignItems: 'center',
		marginVertical: 15
	},
	reactionPickerContainer: {
		borderRadius: 4,
		flexDirection: 'column',
		overflow: 'hidden'
	},
	bannerContainer: {
		paddingVertical: 12,
		paddingHorizontal: 15,
		flexDirection: 'row',
		alignItems: 'center'
	},
	bannerText: {
		flex: 1
	},
	bannerModalTitle: {
		fontSize: 16,
		...sharedStyles.textMedium
	},
	modalView: {
		padding: 20,
		justifyContent: 'center'
	},
	modalScrollView: {
		maxHeight: 100,
		marginVertical: 20
	},
	modalCloseButton: {
		alignSelf: 'flex-end'
	},
	joinRoomContainer: {
		justifyContent: 'flex-end',
		alignItems: 'center',
		marginVertical: 15,
	},
	joinRoomButton: {
		width: 107,
		height: 44,
		marginTop: 15,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 2
	},
	joinRoomText: {
		fontSize: 14,
		...sharedStyles.textMedium
	},
	previewMode: {
		fontSize: 16,
		...sharedStyles.textMedium
	},
	subMessages: {},
	moreText: {
		fontSize: 10,
		lineHeight: 14,
		fontWeight: "400",
		color: "#9D9D9DFF",
		marginLeft: 20,
	},
	subMessages: {
		marginLeft: 15 + 20,
	},
});
