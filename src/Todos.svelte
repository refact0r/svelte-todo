<script>
    import { db } from './firebase';
    import { collectionData, doc, docData } from 'rxfire/firestore';
    import { startWith } from 'rxjs/operators';
    import { quintOut } from 'svelte/easing';
	import { crossfade } from 'svelte/transition';
    import { flip } from 'svelte/animate';

	const [send, receive] = crossfade({
		duration: d => Math.sqrt(d * 200),

		fallback(node, params) {
			const style = getComputedStyle(node);
			const transform = style.transform === 'none' ? '' : style.transform;

			return {
				duration: 300,
				easing: quintOut,
				css: t => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`
			};
		}
	});

    export let uid;

    let text = '';

    const query = db.collection('todos').where('uid', '==', uid).orderBy('order');

    const todos = collectionData(query, 'id').pipe(startWith([]));

	let hovering = null;
    let hoveringComplete = false;

    function add() {
        let length = $todos.length;
        if (text == '') { return; }
        db.collection('todos').add({ uid, text, complete: false, order: length });
        console.log(text + ' added with order ' + length);
        text = '';
    }

    function updateStatus(todo) {
        console.log(todo.text + '(' + todo.id + ') marked ' + !todo.complete);
        db.collection('todos').doc(todo.id).update({ complete: !todo.complete });
    }

    function updateAllIncomplete() {
        db.collection('todos').get().then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
                console.log(doc.data());
                if (doc.data().uid == uid && !doc.data().complete) {
                    doc.ref.update({
                        complete: true
                    });
                }
            });
        });
    }

    function deleteAllComplete() {
        db.collection('todos').get().then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
                if (doc.data().uid == uid && doc.data().complete) {
                    doc.ref.delete();
                }
            });
        });
    }

    function removeItem(todo) {
        console.log(todo.text + '(' + todo.id + ') deleted')
        db.collection('todos').doc(todo.id).delete();
    }
    
    function changeName(event, todo) {
        console.log(todo.text + '(' + todo.id + ') name changed to ' + event.target.value);
        db.collection('todos').doc(todo.id).update({ text: event.target.value });
    }

    function dragStart(event, droppedId, complete) {
        hoveringComplete = complete;
        const data = {droppedId, complete};
        event.dataTransfer.setData('text/plain', JSON.stringify(data));
        hovering = droppedId;
	}

    function drop(event, id, complete) {
		event.preventDefault();
        const json = event.dataTransfer.getData('text/plain');
		const data = JSON.parse(json);
        if (complete !== data.complete) { return; }
        console.log(data.droppedId);
        console.log(id);
        let todo = db.collection('todos').doc(id);
        let droppedTodo = db.collection('todos').doc(data.droppedId);
        todo.get().then((doc) => {
            droppedTodo.update({ order: doc.data().order });
        });
        droppedTodo.get().then((doc) => {
            todo.update({ order: doc.data().order });
        });
	}

    function deselectOnEnter(event) {
        if (event.keyCode === 13) {
            event.target.blur();
        }
    }

</script>

<style>
    .field {
        width: 100%;
        color: var(--text-color);
        padding: 0.4rem 0;
        font-family: inherit;
        font-size: inherit;
        background: none;
        border: none;
    }

    .field:focus {
        outline: none;
    }

    .submit {
        font-size: 1.7em;
        font-weight: 200;
        padding: 0;
        z-index: 100;
        position: relative;
    }

    .form {
        position: relative;
        display: flex;
        border-bottom: 0.1rem solid var(--text-color);
    }

    .form:before {
        content: '';
        position: absolute;
        height: 100%;
        width: 0;
        border-bottom: 0.1rem solid var(--accent-color);
        transition: width 0.2s ease-in-out;
    }

    .form:focus-within:before {
        width: 100%;
        transition: width 0.3s ease-in-out;
    }

    #newItemForm {
        margin: 1rem 0;
    }

    ::placeholder {
        color: var(--sub-color);
    }
    
    .headerBar2 {
        display: flex;
        justify-content: space-between;
    }

    .headerBar2 > * {
		white-space: nowrap;		
	}

    .header2 {
        visibility: hidden;
    }

    .headerBar2:hover > .header2 {
        visibility: visible;
    }

    .check {
        background: none;
        display: block;
        position: relative;
        height: 18px;
        width: 18px;
        cursor: pointer;
        border: 0.1rem solid var(--sub-color);
        border-radius: 0.2rem;
    }

    .check:hover {
        border-color: var(--sub-color);
    }

    .check:focus {
        outline: none;
    }

    .checkmark {
        display: block;
        visibility: hidden;
        pointer-events: none;
        position: relative;
        width: 0.4rem;
        height: 0.8rem;
        right: 0.75rem;
        bottom: 0.1rem;
        border: solid var(--accent-color);
        border-width: 0 0.1rem 0.1rem 0;
        -webkit-transform: rotate(45deg);
        -ms-transform: rotate(45deg);
        transform: rotate(45deg);
    }

    .checkmark.completed {
        visibility: visible;
    }

    .name {
        background: none;
        font-family: inherit;
        font-size: inherit;
        color: inherit;
        border: none;
	    cursor: text;
        margin-left: 0.5rem;
        width: 100%;
        align-self: center; 
    }

    .name:focus {
        outline: none;
    }
    
    .name.completed {
        text-decoration: line-through;
    }

    /*
    .edit {
        display: none;
        position: relative;
        bottom: 0.1rem;
        white-space: nowrap;
        margin-left: auto;
        margin-right: 1rem;
    }

    .line:hover > .edit {
        display: block;
    }
    */

    .delete {
        visibility: hidden;
        font-size: 1.1em;
        position: relative;
        margin-left: 1rem;
        bottom: 0.2rem;
    }

    .line:hover > .delete {
        visibility: visible;
    }

    .lists {
        display: flex;
        justify-content: space-between;
    }

    .list {
        width: 100%;
    }

    .incomplete {
        margin-right: 3rem;
    }

    .line {
        position: relative;
        right: 0.3rem;
        background: none;
        padding: 0.2rem 0.4rem;
        margin: 1rem 0;
        border-radius: 0.3rem;
        width: inherit;
        display: flex;
        align-items: center;
        height: 1.5rem;
    }

    .line.is-active {
        box-shadow: inset 0 0 0 0.1rem var(--accent-color);
    }
</style>

<form class="form" id="newItemForm" autocomplete="off" on:submit|preventDefault={add}>
	<input class="field" id="newItemField" placeholder="add item..." bind:value={text}>
    <button type="submit" class="button submit">+</button>
</form>

<div class="lists">
    <div class="list incomplete">

        <div class="headerBar2">
            <h2 class="header">to-do</h2>
            <button class="button header2" on:click={updateAllIncomplete}>complete all</button>
        </div>

        {#each $todos.filter(t => !t.complete) as todo (todo.id)}

            <div 
                class="line"
                in:receive="{{key: todo.id}}"
                out:send="{{key: todo.id}}"
                animate:flip="{{duration: 300}}"
                on:drop={event => drop(event, todo.id, false)}
                on:dragstart={event => dragStart(event, todo.id, false)}
                on:dragend={() => hovering = null}
                on:dragenter={() => hovering = todo.id}
                ondragover="return false"
                draggable={true}
                class:is-active={hovering === todo.id && hoveringComplete === todo.complete}
            >
                <button class="check" on:click={updateStatus(todo)}></button>
                <span class="checkmark"></span>
                <input class="name" on:change={event => changeName(event, todo)} on:keydown={event => deselectOnEnter(event)} value={todo.text}>
                <button class="button delete" on:click={removeItem(todo)}>✕</button>
            </div>
            
        {/each}
    </div>

    <div class="list complete">

        <div class="headerBar2">
            <h2 class="header">completed</h2>
            <button class="button header2" on:click={deleteAllComplete}>delete all</button>
        </div>
        
        {#each $todos.filter(t => t.complete) as todo (todo.id)}
        
            <div
                class="line"
                in:receive="{{key: todo.id}}"
                out:send="{{key: todo.id}}"
                animate:flip="{{duration: 300}}"
                on:drop={event => drop(event, todo.id, true)}
                on:dragstart={event => dragStart(event, todo.id, true)}
                on:dragend={() => hovering = null}
                on:dragenter={() => hovering = todo.id}
                ondragover="return false"
                draggable={true}
                class:is-active={hovering === todo.id && hoveringComplete === todo.complete}
            >
                <button class="check" on:click={updateStatus(todo)}></button>
                <span class="checkmark completed"></span>
                <span class="name completed">{todo.text}</span>
                <button class="button delete" on:click={removeItem(todo)}>✕</button>
            </div>
            
        {/each}
    </div>
</div>