<template>
  <section class="page_404">
    <div class="content">

      <!-- 大号 404 -->
      <h1 class="error-code">404</h1>

      <!-- 背景图 -->
      <div class="four_zero_four_bg"></div>

      <!-- 按钮和提示 -->
      <div class="contant_box_404">
        <h3 class="h2">页面不存在，请检查页面地址是否正确</h3>
        <router-link to="/" class="link_404">返回首页</router-link>
      </div>
    </div>
  </section>
</template>

<style scoped>
.page_404 {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 40px 20px;
  font-family: "Arvo", serif;
  background: #fff;
}

.content {
  text-align: center;
  width: 100%;
  max-width: 720px;
}

/* 背景图 */
.four_zero_four_bg {
  width: 320px;
  height: 200px;
  margin: 0 auto;
  background-image: url(https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif);
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
}

@media (min-width: 768px) {
  .four_zero_four_bg {
    width: 400px;
    height: 240px;
    background-size: cover;
  }
}

/* 大号 404 */
.error-code {
  font-size: 120px;
  margin: 20px 0 10px;
  font-weight: bold;
  color: #222;
}

/* 按钮和提示 */
.link_404 {
  color: #fff;
  padding: 10px 20px;
  background: #39ac31;
  display: inline-block;
  border-radius: 6px;
  text-decoration: none;
}

.contant_box_404 {
  margin-top: 12px; /* 缩小间距，避免过低 */
}
</style>
