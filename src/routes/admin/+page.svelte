<div class="space-y-6">
	<h1 class="font-heading text-2xl">Admin</h1>
	<p class="text-muted-foreground">Tools voor offertes en facturen.</p>
	<div class="grid gap-3 sm:grid-cols-2">
		<a href="/admin/document?kind=offerte" class="bg-card hover:bg-muted block border p-5 transition">
			<h2 class="font-heading text-lg">Offerte</h2>
			<p class="text-muted-foreground text-sm">Prijsindicatie zonder factuurnummer.</p>
		</a>
		<a href="/admin/document?kind=factuur" class="bg-card hover:bg-muted block border p-5 transition">
			<h2 class="font-heading text-lg">Factuur</h2>
			<p class="text-muted-foreground text-sm">Met factuurnummer en betaalinstructies.</p>
		</a>
		<a href="/admin/document?kind=kwitantie" class="bg-card hover:bg-muted block border p-5 transition">
			<h2 class="font-heading text-lg">Kwitantie</h2>
			<p class="text-muted-foreground text-sm">Bewijs van betaling, geen BTW.</p>
		</a>
		<a href="/admin/calculator" class="bg-card hover:bg-muted block border p-5 transition">
			<h2 class="font-heading text-lg">Calculator</h2>
			<p class="text-muted-foreground text-sm">Bereken een offerteprijs met sliders.</p>
		</a>
	</div>
</div>
