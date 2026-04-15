<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	export let data: PageData;

	const { org, students, profile } = data;

	let totalStudents = students.length;
	let activeStudents = students.filter((s) => s.messages_today > 0).length;
	let totalMessagesToday = students.reduce((sum, s) => sum + (s.messages_today || 0), 0);

	function getLevelLabel(level: string | null) {
		if (!level) return 'Unknown';
		return level;
	}
</script>

<svelte:head>
	<title>Dashboard - XYLO School Admin</title>
</svelte:head>

<!-- We force light mode palette to exactly match the landing page -->
<div class="min-h-screen bg-[#f8fafc] text-slate-900 font-sans pb-12">
	
	<!-- Match aw-header -->
	<header class="sticky top-0 z-50 bg-white/90 backdrop-blur-[12px] border-b border-slate-200">
		<div class="w-full max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
			<div class="flex items-center gap-4">
				<a href="/" class="text-[1.375rem] font-[800] text-[#f59e0b] tracking-[-0.03em]">XYLO</a>
				<span class="text-xs font-bold uppercase tracking-widest px-3 py-1 bg-slate-100 text-slate-500 rounded-full">School Admin</span>
			</div>
			<div>
				<button class="inline-flex items-center gap-2 px-[1.125rem] py-2 bg-transparent text-slate-600 font-medium text-[0.875rem] rounded-lg transition-colors hover:text-slate-900 hover:bg-slate-100" onclick={() => goto('/auth/login')}>
					Log out
				</button>
			</div>
		</div>
	</header>

	<main class="w-full max-w-[1200px] mx-auto px-6 pt-12">
		{#if !org}
			<div class="flex items-start gap-6 bg-white border border-slate-200 border-l-4 border-l-[#f59e0b] rounded-[0.75rem] p-8 max-w-2xl mx-auto shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
				<div class="text-[2rem] leading-none shrink-0">💡</div>
				<div>
					<h2 class="text-xl font-bold text-slate-900 mb-2">Organization Setup Pending</h2>
					<p class="text-[1.125rem] text-slate-700 leading-[1.75]">
						Your profile is not yet linked to an active school organization. Please contact XYLO support or finish your setup to view student data.
					</p>
				</div>
			</div>
		{:else}
			
			<!-- Dashboard Header -->
			<div class="mb-10">
				<p class="text-[0.8125rem] font-bold text-[#f59e0b] uppercase tracking-[0.08em] mb-3">Overview</p>
				<h1 class="text-[clamp(1.625rem,4vw,2.25rem)] font-bold tracking-[-0.025em] leading-[1.2] text-slate-900 mb-4">
					{org.name} Dashboard
				</h1>
				<p class="text-[1.0625rem] text-slate-500 leading-[1.7]">
					Plan: <strong class="capitalize text-slate-700">{org.plan}</strong> &nbsp;·&nbsp; Seats Used: <strong class="text-slate-700">{totalStudents} / {org.seat_limit}</strong>
				</p>
			</div>

			<!-- Match aw-stats / aw-feature-card styling for metrics -->
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
				<div class="bg-white border border-slate-200 rounded-[0.875rem] p-[1.75rem] shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.07)]">
					<h3 class="text-[1.0625rem] font-bold text-slate-900 mb-2">Total Enrolled</h3>
					<div class="text-[2.5rem] font-[800] text-[#f59e0b] tracking-[-0.03em] leading-none">{totalStudents}</div>
					<p class="text-[0.9375rem] text-slate-500 mt-3 border-t border-slate-100 pt-3">Students in your organization</p>
				</div>
				
				<div class="bg-white border border-slate-200 rounded-[0.875rem] p-[1.75rem] shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.07)] relative overflow-hidden">
					<div class="absolute top-0 left-0 w-full h-[3px] bg-green-500"></div>
					<h3 class="text-[1.0625rem] font-bold text-slate-900 mb-2">Active Today</h3>
					<div class="text-[2.5rem] font-[800] text-green-500 tracking-[-0.03em] leading-none">{activeStudents}</div>
					<p class="text-[0.9375rem] text-slate-500 mt-3 border-t border-slate-100 pt-3">Students who sent at least 1 msg today</p>
				</div>
				
				<div class="bg-white border border-slate-200 rounded-[0.875rem] p-[1.75rem] shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.07)]">
					<h3 class="text-[1.0625rem] font-bold text-slate-900 mb-2">Total Messages</h3>
					<div class="text-[2.5rem] font-[800] text-slate-900 tracking-[-0.03em] leading-none">{totalMessagesToday}</div>
					<p class="text-[0.9375rem] text-slate-500 mt-3 border-t border-slate-100 pt-3">AI interactions today across school</p>
				</div>
			</div>

			<!-- Match aw-school-card functionality for the table -->
			<div class="bg-white border border-slate-200 rounded-[1rem] shadow-[0_8px_32px_rgba(0,0,0,0.06)] overflow-hidden">
				<div class="flex items-center justify-between p-6 border-b border-slate-100 bg-[#f8fafc]/50">
					<div class="flex items-center gap-4">
						<span class="text-[2rem]">🏫</span>
						<h2 class="text-[1.125rem] font-bold text-slate-900">Student Directory</h2>
					</div>
					{#if org.invite_code}
						<div class="text-[0.8125rem] text-slate-500 bg-white px-3 py-1.5 rounded-md border border-slate-200 shadow-sm">
							Invite Code: <span class="font-mono font-bold text-[#f59e0b] ml-2 text-[0.9rem] bg-[#fffbeb] border border-[#fde68a] px-2 py-0.5 rounded">{org.invite_code}</span>
						</div>
					{/if}
				</div>
				
				<div class="overflow-x-auto">
					{#if students.length === 0}
						<div class="py-16 px-6 text-center text-slate-500">
							<div class="text-4xl mb-4 opacity-50">👩🏾‍🎓</div>
							<p class="text-[1.0625rem]">No students have joined your organization yet.</p>
							<p class="text-[0.9375rem] mt-2">Share your invite code with them to get started.</p>
						</div>
					{:else}
						<table class="w-full text-left">
							<thead>
								<tr class="border-b border-slate-200 bg-slate-50/50 text-[0.8125rem] font-bold text-slate-500 uppercase tracking-[0.06em]">
									<th class="py-4 px-6 font-semibold">Name</th>
									<th class="py-4 px-6 font-semibold">Class</th>
									<th class="py-4 px-6 font-semibold">Curriculum</th>
									<th class="py-4 px-6 font-semibold">Status</th>
									<th class="py-4 px-6 font-semibold text-right">Msgs Today</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-slate-100">
								{#each students as student}
									<tr class="transition-colors hover:bg-slate-50 group">
										<td class="py-4 px-6 font-medium text-slate-900">{student.full_name || 'Anonymous Student'}</td>
										<td class="py-4 px-6 text-[0.9375rem] text-slate-500">{getLevelLabel(student.level)}</td>
										<td class="py-4 px-6">
											{#if student.curriculum}
												<span class="inline-block px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-600 font-semibold border border-slate-200">
													{student.curriculum}
												</span>
											{:else}
												<span class="text-slate-400 text-sm italic">Not set</span>
											{/if}
										</td>
										<td class="py-4 px-6">
											{#if student.messages_today > 0}
												<span class="inline-flex items-center gap-2 text-[0.875rem] font-bold text-green-600">
													<span class="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></span> Active
												</span>
											{:else}
												<span class="inline-flex items-center gap-2 text-[0.875rem] font-medium text-slate-400">
													<span class="w-2 h-2 rounded-full bg-slate-300"></span> Inactive
												</span>
											{/if}
										</td>
										<td class="py-4 px-6 text-right">
											<span class="font-mono font-bold {student.messages_today > 0 ? 'text-slate-900' : 'text-slate-400'}">
												{student.messages_today}
											</span>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					{/if}
				</div>
			</div>
		{/if}
	</main>
</div>
