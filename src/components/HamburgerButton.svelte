<script lang="ts">
  export let open: boolean = false;
  export let left: boolean = true;
  $: fontColor = open ? "text-red-500" : "text-gray-500";
  $: hoverFontColor = open ? "text-red-700" : "text-gray-700";
</script>

<style>
  svg {
    min-height: 24px;
    transition: transform 0.3s ease-in-out;
  }

  svg line {
    stroke: currentColor;
    stroke-width: 3;
    transition: transform 0.3s ease-in-out;
  }

  button {
    z-index: 20;
  }

  .open svg {
    transform: scale(0.7);
  }

  .open #top {
    transform: translate(6px, 0px) rotate(45deg);
  }

  .open #middle {
    opacity: 0;
  }

  .open #bottom {
    transform: translate(-12px, 9px) rotate(-45deg);
  }
</style>

<button
  class="{fontColor} hover:{hoverFontColor} cursor-pointer my-4 border-none focus:outline-none"
  class:open
  on:click={() => (open = !open)}>
  <svg width="32" height="24">
    <line id="top" x1="0" y1="2" x2="32" y2="2" />
    <line
      id="middle"
      x1={left ? '0' : '8'}
      y1="12"
      x2={left ? '24' : '32'}
      y2="12" />
    <line id="bottom" x1="0" y1="22" x2="32" y2="22" />
  </svg>
</button>
