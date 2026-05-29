const profile = {
	// src/assets/images
	update_at: '2024-07-29',
	profile_picture_filename: 'photo.jpg',
	full_name: 'Mukhlis Adhe Purwanto',
	city: 'Bekasi',
	province: 'West Java',
	country: 'Indonesia',
	position: 'Front-end Developer',
	summary: 'A Web Developer focused primarily on front-end development, creating user-friendly, visually appealing interfaces with optimal performance.',
	contact: [
		// available whatsapp | email | github | linkedin
		{ type: 'whatsapp', label: '+6285329000180', url: 'https://wa.me/6285329000180' },
		{ type: 'email', label: 'adhemukhlis@gmail.com', url: 'mailto:adhemukhlis@gmail.com' },
		{ type: 'github', label: 'adhemukhlis', url: 'https://github.com/adhemukhlis' },
		{
			type: 'linkedin',
			label: 'Mukhlis Adhe Purwanto',
			url: 'https://www.linkedin.com/in/mukhlis-adhe-purwanto',
		},
	],
	skills: [{ label: 'Team Work' }, { label: 'Problem Solving' }],
	technical_skills: [{ label: 'Javascript' }, { label: 'React.js' }, { label: 'Next.js' }, { label: 'Git' }, { label: 'Docker' }],
	certifications: [{ label: 'BNSP Junior Web Developer' }],
	educations: [
		{
			study_program: 'Bachelor of Computer Science',
			institution: 'Institut Teknologi Telkom Purwokerto',
			year_of_start: '2016',
			year_of_end: '2023',
			GPA: '3.61',
			final_project_title: 'Development Of Cubar Math Educational Games Using The GDLC Method',
			final_project_description: 'I developed a web-based online game with multiplayer capabilities for my final project.',
		},
		{
			study_program: 'Software Engineering',
			institution: 'SMK Telekomunikasi Telesandi Bekasi',
			year_of_start: '2013',
			year_of_end: '2016',
		},
	],
	experiences: [
		{
			company_name: 'PT Wiratek Solusi Asia',
			location: 'Jakarta, Indonesia',
			position: 'Front-end Developer',
			start: '2021-07-8',
			end: '2024-04-25',
			content:
				'Involved in several projects using Vue.js, React.js, and Next.js. Sometimes also helps define API specifications, deploys on servers with Docker, and maintains internal team code quality.\nProjects involved:',
			projects: ['Flowalytics', 'Kostzy CoLiveWorkPlay'],
		},
		{
			company_name: 'PT Samudra Biru Development',
			location: 'Bogor, Indonesia',
			position: 'Front-end Developer',
			start: '2020-07-22',
			end: '2021-03-10',
			content: 'Involved in developing Payroll and Human Resource Apps.',
			projects: ['Ocean'],
		},
	],
}

export default profile
