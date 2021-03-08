<script>
    import Todos from './Todos.svelte';

    import { auth, googleProvider } from './firebase';
    import { authState } from 'rxfire/auth';
	
	import {theme} from './store.js';
	import { fly } from 'svelte/transition';

	$: {
		console.log($theme);
		let classes = window.document.body.className.split(' ');
		classes.pop();
		classes.push($theme + '-theme');
		window.document.body.className = classes.join(' '); 
	}

    let user;

	let showThemeBox = false;

    const unsubscribe = authState(auth).subscribe(u => user = u);

    function login() {
        auth.signInWithPopup(googleProvider);
    }

	function logout() {
		auth.signOut();
	}
</script>

<svelte:head>
</svelte:head>

<style>
	main {
		margin-top: 5rem;
		display: grid;
		grid-template-columns: auto 15rem 60rem 15rem auto;
		grid-column-gap: 2rem;
	}
	#mainBox {
		grid-column: 3 / 4;
	}
	#themeBox {
		height: fit-content;
	}
	.headerBar {
		display: flex;
		margin-bottom: 2rem;
	}
	.headerBar > * {
		white-space: nowrap;		
	}
	#logoutButton {
		margin-right: 2rem;
	}
</style>

<main class="content">

	<div class="box" id="mainBox">
		{#if user}
			<div class="headerBar">
				<h1 class="header top">hello, {user.displayName}!</h1>
				<button on:click={ () => logout() } class="button" id="logoutButton">logout</button>
				<button on:click={ () => showThemeBox = !showThemeBox} class="button" id="themeButton">theme</button>
			</div>

			<section>
				<Todos uid={user.uid} />
			</section>
		{:else}
			<div class="headerBar">
				<h1 class="header top">svelte to-do</h1>
				<button on:click={login} class="button">sign in with google</button>
			</div>

			<p class="text">
				welcome to svelte to-do! this is a to-do list app made with svelte and firebase. 
				<br>
				sign in to get started.
			</p>
		{/if}
	</div>

	{#if showThemeBox}
		<div class="box" id="themeBox" transition:fly="{{ x: 300, duration: 300 }}">
			<h3 class="header top">themes</h3>
			<button on:click={ () => theme.set('dark')} class="button">dark</button>
			<br>
			<button on:click={ () => theme.set('light')} class="button">light</button>
			<br>
			<button on:click={ () => theme.set('midnight')} class="button">midnight</button>
			<br>
			<button on:click={ () => theme.set('nebula')} class="button">nebula</button>
			<br>
			<button on:click={ () => theme.set('olivia')} class="button">olivia</button>
			<br>
			<button on:click={ () => theme.set('laser')} class="button">laser</button>
			<br>
			<button on:click={ () => theme.set('carbon')} class="button">carbon</button>
		</div>
	{/if}

</main>