import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get("window")
export default StyleSheet.create({
	container: {
		flex: 1
	},
	companyTitlePng: {
		width: 48,
		height: 27,
	},
	searchPng: {
		width: 18,
		height: 18
	},
	emptyBox: {
		paddingVertical: 50,
		flex: 1,
		justifyContent: "center",
		alignItems: "center"
	},
	noMore: {
		fontSize: 20,
		fontWeight: '400',
		color: '#000000FF',
		lineHeight: 28,
		marginBottom: 8,
	},
	noMore1: {
		fontSize: 14,
		fontWeight: '400',
		color: '#818181FF',
		lineHeight: 20,
		marginBottom: 11,

	},
	noMore2: {
		fontSize: 14,
		fontWeight: '600',
		color: '#836BFFFF',
		lineHeight: 28,
	},
	rightIcon: {
		width: 80,
		height: 80,
		marginBottom: 20,
	},
});
