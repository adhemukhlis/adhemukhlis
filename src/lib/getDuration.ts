function getDuration(startDateString: string, endDateString: string) {
	const startDate = new Date(startDateString)
	const endDate = new Date(endDateString)

	const totalMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth()) + 1

	const years = Math.floor(totalMonths / 12)
	const months = totalMonths % 12

	return { years, months }
}

export default getDuration
