import emailIcon from '@/assets/Base64Icon/email'
import githubIcon from '@/assets/Base64Icon/github'
import linkedinIcon from '@/assets/Base64Icon/linkedin'
import locationIcon from '@/assets/Base64Icon/location'
import whatsappIcon from '@/assets/Base64Icon/whatsapp'
import profile from '@/constants/profile'
import getDuration from '@/lib/getDuration'

import type { TDocumentDefinitions } from 'pdfmake/interfaces'

const CM = 28.35 as const
const gapSize = 16 as const

const availableContactIcon = {
	whatsapp: whatsappIcon,
	email: emailIcon,
	github: githubIcon,
	linkedin: linkedinIcon,
}

const availableContactType = Object.keys(availableContactIcon)

export const docDefinition = (): TDocumentDefinitions => {
	const _experiences = Array.isArray(profile.experiences)
		? profile.experiences.map(({ company_name, position, start, end, location, content, projects }) => {
				const startDateFormatted = start
					? new Date(start).toLocaleDateString('en-US', {
							// day: '2-digit',
							month: 'short',
							year: 'numeric',
						})
					: '*'

				const endDateFormatted = start
					? new Date(end).toLocaleDateString('en-US', {
							// day: '2-digit',
							month: 'short',
							year: 'numeric',
						})
					: 'now'

				const duration = getDuration(start, end)

				const durationFormatted = new Intl.DurationFormat('en-US', { style: 'narrow' }).format(duration)

				return {
					company_name,
					position_and_duration: `${position} | ${startDateFormatted} - ${endDateFormatted} (${durationFormatted})`,
					location,
					content,
					projects: Array.isArray(projects) ? projects : [],
				}
			})
		: []

	const _educations = Array.isArray(profile.educations) ? profile.educations : []

	const _city = [profile.city, profile.province].join(', ')
	const _skills = profile.skills.map(({ label }) => label).join(' • ')
	const _technical_skills = profile.technical_skills.map(({ label }) => label).join(' • ')
	const _certifications = profile.certifications.map(({ label }) => label)

	const FullNameSection = [{ text: profile.full_name, style: 'fullNameStyle' }]
	const PositionSection = [{ text: profile.position, fontSize: 12, bold: true }]

	const SummarySection = [
		{
			text: profile.summary,
			style: 'contentStyle',
		},
	]

	const ExperiencesSection = _experiences.flatMap(({ company_name, position_and_duration, location, content, projects }) => [
		[
			{
				text: company_name,
				style: 'titleContentStyle',
			},
		],
		[
			{
				text: position_and_duration,
			},
		],
		[{ text: location, fontSize: 10 }],
		[
			{
				text: content,
				style: 'contentStyle',
			},
		],
		[
			{
				ol: projects,
			},
		],
	])

	const ContactSection = [
		{
			layout: 'noBorders',
			table: {
				widths: [16, '*'],
				body: [
					[
						{
							svg: locationIcon,
							fit: [16, 16] as [number, number],
						},
						_city,
					],
					...profile.contact
						.filter((item) => availableContactType.includes(item?.type))
						.map((item) => [
							{
								svg: availableContactIcon[item?.type as keyof typeof availableContactIcon],
								fit: [16, 16] as [number, number],
							},
							{
								text: (item?.label || '')
									.split(/(.{21})/)
									.filter((chunk) => chunk.length > 0)
									.join('\n'),
								link: item.url,
							},
						]),
				],
			},
		},
	]

	const EducationsSection = _educations.flatMap(({ study_program, institution, year_of_start, year_of_end, final_project_description, ...other }) => [
		[
			{
				text: institution || '<institution>',
				style: 'titleContentStyle',
			},
		],
		[
			{
				text: `${study_program || '<study_program>'} (${year_of_start || '<year_of_start>'} - ${year_of_end || '<year_of_end>'})`,
				style: 'subContentStyle',
			},
		],
		...(final_project_description
			? [
					[
						{
							text: final_project_description,
						},
					],
				]
			: []),
		...(Object.keys(other).length > 0
			? [
					[
						{
							ul: [`GPA : ${other?.GPA || '<GPA>'}`],
						},
					],
				]
			: []),
	])

	const SpecialtiesSection = [
		{
			text: _skills,
		},
	]

	const ToolsSection = [
		{
			text: _technical_skills,
		},
	]

	const CertificationsSection = [
		{
			ul: _certifications,
		},
	]

	// const dateStamp: ContentText = {
	// 	text: new Date().toLocaleDateString('en-US', {
	// 		day: '2-digit',
	// 		month: 'long',
	// 		year: 'numeric',
	// 	}),
	// 	alignment: 'center',
	// }

	return {
		compress: true,
		version: '1.7',
		displayTitle: true,
		permissions: {
			printing: 'highResolution',
			modifying: false,
			copying: false,
			annotating: false,
			fillingForms: false,
			contentAccessibility: false,
			documentAssembly: false,
		},
		pageSize: 'A4',
		pageMargins: [2 * CM, 2 * CM, 2 * CM, 2 * CM],
		info: {
			title: '[RESUME] MUKHLIS ADHE PURWANTO',
			author: '',
			subject: '',
			keywords: '',
			creator: '',
			producer: '',
		},
		content: [
			{
				columns: [
					{
						width: '*',
						layout: 'noBorders',
						table: {
							widths: ['*'],
							body: [
								FullNameSection,
								PositionSection,
								SummarySection,
								[{ text: 'EXPERIENCE', style: 'titleStyle' }],
								...ExperiencesSection, // need spread array
							],
						},
					},
					{
						width: '*',
						layout: 'noBorders',
						table: {
							widths: ['*'],
							body: [
								ContactSection,
								[{ text: 'EDUCATION', style: 'titleStyle' }],
								...EducationsSection, // need spread array
								[{ text: 'SKILLS', style: 'titleStyle' }],
								[
									{
										text: 'Specialties',
										style: 'titleContentStyle',
									},
								],
								SpecialtiesSection,
								[
									{
										text: 'Tools',
										style: 'titleContentStyle',
									},
								],
								ToolsSection,
								[{ text: 'Certifications', style: 'titleContentStyle' }],
								CertificationsSection,
							],
						},
					},
				],
			},
		],
		styles: {
			fullNameStyle: {
				fontSize: 14,
				bold: true,
			},
			titleStyle: {
				fontSize: 10,
				bold: true,
				color: '#666666',
				margin: [0, gapSize, 0, (gapSize / 2) * -1],
			},
			subContentStyle: {
				color: '#666666',
			},
			titleContentStyle: {
				bold: true,
				fontSize: 12,
				margin: [0, gapSize / 2, 0, 0],
			},
			contentStyle: {
				alignment: 'justify',
				margin: [0, gapSize / 3, 0, 0],
			},
		},
		defaultStyle: {
			font: 'NotoSerif',
			color: '#000',
			fontSize: 10,
			columnGap: 16,
		},
	}
}
