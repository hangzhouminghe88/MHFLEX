<template>
  <div class="spinner">
    <div class="spinner__item1"></div>
    <div class="spinner__item2"></div>
    <div class="spinner__item3"></div>
    <div class="spinner__item4"></div>
  </div>
</template>
<script>
  export default{
    name:'Loading',
  }
</script>

<style scoped>
  html {
    min-height: 100%;
    height: 100%;
    overflow: auto;
  }
  body {
    background: #212121;
    background-image: linear-gradient(to bottom, rgba(#212121, .80), rgba(#191919, .90)), url($background);
    background-image: -webkit-linear-gradient(to bottom, rgba(#212121, .80), rgba(#191919, .90)), url($background);
    background-size: cover, 250px 250px;
    background-attachment: fixed, inherit;
    -webkit-backface-visibility: hidden;
  }
  .spinner {
    margin: 0 auto;
    width: 200px;
    height: 200px;
    text-align: center;
  }
  .spinner > div{
    width: 10px;
    height: 10px;
    background-color: #007FDF;
    border-radius: 100%;
    display: inline-block;
    animation: sk-bouncedelay 1.7s infinite ease-in-out both;
    margin-right: 5px;
  }
  .spinner--orange > div{
    background: #FF9A27;
  }
  .spinner--cyan > div {
    background: #3FCCA1;
  }
  .spinner--yellow > div {
    background: #F2D915;
  }
  .spinner .spinner__item1 {
    animation-delay: -0.60s;
  }
  .spinner .spinner__item2 {
    animation-delay: -0.40s;
  }
  .spinner .spinner__item3{
    animation-delay: -0.20s;
  }
  @keyframes sk-bouncedelay {
    0%, 80%, 100% {
      transform: scale(0);
      opacity: 0;
    }
    40% {
      transform: scale(1.0);
      opacity: 1;
    }
  }
</style>
