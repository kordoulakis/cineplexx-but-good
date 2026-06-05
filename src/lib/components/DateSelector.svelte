<script lang="ts">
	import Calendar from "$lib/components/ui/calendar/calendar.svelte";
	import * as Popover from "$lib/components/ui/popover/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
	import CalendarIcon from "@lucide/svelte/icons/calendar";
	import {
		getLocalTimeZone,
		parseDate,
		today,
		type DateValue
	} from "@internationalized/date";
	import { cn } from "$lib/utils";

	let { value = $bindable() }: { value: string } = $props();

	let open = $state(false);
	
	// Internal calendar state synced with the string value prop
	let calendarValue = $state<DateValue>(parseDate(value));

	// Sync internal state when external value changes
	$effect(() => {
		if (value) {
			try {
				const parsed = parseDate(value);
				if (parsed.toString() !== calendarValue?.toString()) {
					calendarValue = parsed;
				}
			} catch (e) {
				console.error("Failed to parse date:", value, e);
			}
		}
	});

	// Update external value when internal state changes
	$effect(() => {
		if (calendarValue) {
			const newValue = calendarValue.toString();
			if (value !== newValue) {
				value = newValue;
			}
		}
	});

	const quickDates = [0, 1, 2, 3, 4, 5].map(offset => ({
		date: today(getLocalTimeZone()).add({ days: offset }),
		label: offset === 0 ? "Today" : null
	}));

	const formatDate = (date: DateValue) => {
		return date.toDate(getLocalTimeZone()).toLocaleDateString(undefined, {
			weekday: 'short',
			month: 'short',
			day: 'numeric'
		});
	};

	const isSelected = (date: DateValue) => date.toString() === value;
</script>

<div class="flex flex-col gap-4 w-full">
	<div class="flex items-center gap-3">
		<span class="text-xs font-bold uppercase tracking-widest text-muted-foreground">Select Date</span>
		
		<div class="flex flex-wrap gap-2">
			{#each quickDates as { date, label } (date.toString())}
				<Button
					variant={isSelected(date) ? "default" : "outline"}
					size="sm"
					class={cn(
						"font-bold transition-all",
						isSelected(date) ? "shadow-md" : "border-primary/20 hover:border-primary"
					)}
					style="cursor: pointer"
					onclick={() => {
						calendarValue = date;
						value = date.toString();
					}}
				>
					{label ?? formatDate(date)}
				</Button>
			{/each}

			<Popover.Root bind:open>
				<Popover.Trigger>
					{#snippet child({ props })}
						<Button
							{...props}
							variant="outline"
							size="sm"
							class={cn(
								"font-bold border-2 transition-colors flex gap-2 items-center",
								!quickDates.some(d => isSelected(d.date)) 
									? "border-primary bg-primary/5" 
									: "border-primary/20 hover:border-primary"
							)}
						>
							<CalendarIcon class="h-4 w-4" />
							{#if !quickDates.some(d => isSelected(d.date))}
								{formatDate(calendarValue)}
							{:else}
								More
							{/if}
							<ChevronDownIcon class="h-4 w-4 opacity-50" />
						</Button>
					{/snippet}
				</Popover.Trigger>
				<Popover.Content class="w-auto p-0" align="start">
					<Calendar
						type="single"
						bind:value={calendarValue}
						onValueChange={(v) => {
							if (v) {
								calendarValue = v;
								value = v.toString();
								open = false;
							}
						}}
					/>
				</Popover.Content>
			</Popover.Root>
		</div>
	</div>
</div>
