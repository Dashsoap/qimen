<template>
  <div class="about-container">
    <div class="about">
      <h1 class="title">文昌帝君宝诰</h1>
      
      <section class="introduction">
        <h2>鬼谷流派祖师 - 文昌帝君</h2>
        <p>文昌帝君，又称梓潼帝君，是中国道教的重要神祇，主管功名利禄、文运昌盛。作为鬼谷的祖师爷，文昌帝君象征着智慧、学识与道德的完美结合。他不仅保佑文人学子金榜题名，更引导世人向善向美，提升品德修养。</p>
        <p>诵读文昌帝君宝诰，能够净化心灵，开启智慧，增长福报，对学业、事业有莫大裨益。</p>
      </section>

      <section class="invocation">
        <h2>宝诰全文</h2>
        <div class="content">
          志心皈命礼。不骄帝境。玉真庆宫。现九十八化之行藏。显亿千万种之神异。飞鸾开化于在在，如意救劫以生生。至孝至仁，功存乎儒道释教。不骄不乐，职尽乎天地水官。功德难量。威灵莫测。大悲大愿。大圣大慈。九天辅元。开化主宰。司禄职贡举真君。七曲灵应，保德弘仁大帝。谈经演教。消劫行化。更生永命天尊。
        </div>
      </section>

      <section class="participation">
        <h2>诚邀共修</h2>
        <p>我们诚挚邀请您:</p>
        <ul>
          <li>每日恭敬抄写文昌帝君宝诰，以增长智慧，培养专注力</li>
          <li>诵读宝诰，净化心灵，提升品德，获得文昌帝君的庇佑</li>
          <li>将宝诰精神融入生活，明理向善，积累功德</li>
        </ul>
        <p>共同修持，同沐文昌帝君恩泽，共创美好未来。</p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.about-container {
  padding: 2rem;
  background-color: #0a1226;
  color: #b8c7d9;
  min-height: 100vh;
}

.about {
  max-width: 800px;
  margin: 0 auto;
}

.title {
  font-size: 2.5rem;
  color: #d4af37;
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #3a506b;
}

section {
  margin-bottom: 3rem;
  background-color: rgba(16, 33, 65, 0.7);
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

h2 {
  color: #d4af37;
  font-size: 1.8rem;
  margin-bottom: 1rem;
  border-left: 4px solid #d4af37;
  padding-left: 1rem;
}

.content {
  font-size: 1.25rem;
  line-height: 2;
  text-align: justify;
  background-color: rgba(10, 22, 46, 0.7);
  padding: 2rem;
  border-radius: 8px;
  margin-top: 1rem;
  border: 1px solid #3a506b;
}

.participation ul {
  padding-left: 1.5rem;
  margin: 1rem 0;
}

.participation li {
  margin-bottom: 0.5rem;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .about-container {
    padding: 1rem;
  }
  
  .title {
    font-size: 2rem;
  }
  
  h2 {
    font-size: 1.5rem;
  }
  
  .content {
    font-size: 1.1rem;
    padding: 1rem;
  }
}
</style>
