<template>
  <div class="home-page">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      <div class="banner-content">
<h1 class="welcome-title">{{ t('home.welcomeTitle') }}</h1>
<p class="welcome-subtitle">{{ t('home.welcomeSubtitle') }}</p>
        <div class="banner-decoration">
          <div class="decoration-circle"></div>
          <div class="decoration-circle"></div>
          <div class="decoration-circle"></div>
        </div>
      </div>
    </div>

    <!-- 功能特性 -->
    <div class="features-section">
      <div class="section-title">
        <h2>{{ t('home.coreFeatures') }}</h2>
        <p>{{ t('home.coreFeaturesDesc') }}</p>
      </div>

      <div class="features-grid">
        <el-card class="feature-card" shadow="hover">
          <div class="feature-icon">
            <el-icon><Connection /></el-icon>
          </div>
          <h3 class="feature-title">{{ t('home.fListenerTitle') }}</h3>
          <p class="feature-desc">{{ t('home.fListenerDesc') }}</p>
          <ul class="feature-list">
            <li><el-icon><Check /></el-icon> {{ t('home.fWs') }}</li>
            <li><el-icon><Check /></el-icon> {{ t('home.fTcp') }}</li>
            <li><el-icon><Check /></el-icon> {{ t('home.fKcp') }}</li>
            <li><el-icon><Check /></el-icon> {{ t('home.fOss') }}</li>
          </ul>
        </el-card>

        <el-card class="feature-card" shadow="hover">
          <div class="feature-icon">
            <el-icon><Download /></el-icon>
          </div>
          <h3 class="feature-title">{{ t('home.fGenTitle') }}</h3>
          <p class="feature-desc">{{ t('home.fGenDesc') }}</p>
          <ul class="feature-list">
            <li><el-icon><Check /></el-icon> Windows / Linux / macOS</li>
            <li><el-icon><Check /></el-icon> {{ t('home.fMultiArch') }}</li>
            <li><el-icon><Check /></el-icon> {{ t('home.fOneClick') }}</li>
            <li><el-icon><Check /></el-icon> {{ t('home.fCustomPwd') }}</li>
          </ul>
        </el-card>

        <el-card class="feature-card" shadow="hover">
          <div class="feature-icon">
            <el-icon><Promotion /></el-icon>
          </div>
          <h3 class="feature-title">{{ t('home.fDeliveryTitle') }}</h3>
          <p class="feature-desc">{{ t('home.fDeliveryDesc') }}</p>
          <ul class="feature-list">
            <li><el-icon><Check /></el-icon> {{ t('home.fFastDeploy') }}</li>
            <li><el-icon><Check /></el-icon> {{ t('home.fAutoCmd') }}</li>
            <li><el-icon><Check /></el-icon> {{ t('home.fShellcode') }}</li>
            <li><el-icon><Check /></el-icon> {{ t('home.fMonitor') }}</li>
          </ul>
        </el-card>

        <el-card class="feature-card" shadow="hover">
          <div class="feature-icon">
            <el-icon><Monitor /></el-icon>
          </div>
          <h3 class="feature-title">{{ t('home.fClientTitle') }}</h3>
          <p class="feature-desc">{{ t('home.fClientDesc') }}</p>
          <ul class="feature-list">
            <li><el-icon><Check /></el-icon> {{ t('home.fOnline') }}</li>
            <li><el-icon><Check /></el-icon> {{ t('home.fShell') }}</li>
            <li><el-icon><Check /></el-icon> {{ t('home.fFile') }}</li>
            <li><el-icon><Check /></el-icon> {{ t('home.fProcess') }}</li>
          </ul>
        </el-card>
      </div>
    </div>

    <!-- 快速开始 -->
    <div class="quick-start-section">
      <div class="section-title">
        <h2>{{ t('home.quickStart') }}</h2>
        <p>{{ t('home.quickStartDesc') }}</p>
      </div>

      <div class="steps-container">
        <div class="step-card">
          <div class="step-number">1</div>
          <h3 class="step-title">{{ t('home.step1Title') }}</h3>
          <p class="step-desc">{{ t('home.step1Desc') }}</p>
          <el-button type="primary" @click="goToListener" class="step-btn">
            <el-icon><Position /></el-icon>
            {{ t('home.goListeners') }}
          </el-button>
        </div>

        <div class="step-arrow">
          <el-icon><ArrowRight /></el-icon>
        </div>

        <div class="step-card">
          <div class="step-number">2</div>
          <h3 class="step-title">{{ t('home.step2Title') }}</h3>
          <p class="step-desc">{{ t('home.step2Desc') }}</p>
          <el-button type="primary" @click="goToClient" class="step-btn">
            <el-icon><Download /></el-icon>
            {{ t('home.goGenerate') }}
          </el-button>
        </div>

        <div class="step-arrow">
          <el-icon><ArrowRight /></el-icon>
        </div>

        <div class="step-card">
          <div class="step-number">3</div>
          <h3 class="step-title">{{ t('home.step3Title') }}</h3>
          <p class="step-desc">{{ t('home.step3Desc') }}</p>
          <el-button type="primary" @click="goToClients" class="step-btn">
            <el-icon><Monitor /></el-icon>
            {{ t('home.goClients') }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 使用技巧 -->
    <div class="tips-section">
      <div class="section-title">
        <h2>{{ t('home.tipsTitle') }}</h2>
        <p>{{ t('home.tipsDesc') }}</p>
      </div>

      <div class="tips-grid">
        <div class="tip-item">
          <el-icon class="tip-icon"><InfoFilled /></el-icon>
          <h4>{{ t('home.tipProtoTitle') }}</h4>
          <p>{{ t('home.tipProtoDesc') }}</p>
        </div>

        <div class="tip-item">
          <el-icon class="tip-icon"><Lock /></el-icon>
          <h4>{{ t('home.tipSecTitle') }}</h4>
          <p>{{ t('home.tipSecDesc') }}</p>
        </div>

        <div class="tip-item">
          <el-icon class="tip-icon"><MagicStick /></el-icon>
          <h4>{{ t('home.tipScTitle') }}</h4>
          <p>{{ t('home.tipScDesc') }}</p>
        </div>

        <div class="tip-item">
          <el-icon class="tip-icon"><Document /></el-icon>
          <h4>{{ t('home.tipCmdTitle') }}</h4>
          <p>{{ t('home.tipCmdDesc') }}</p>
        </div>
      </div>
    </div>

    <!-- 版本信息 -->
    <div class="version-section">
      <el-card class="version-card" shadow="hover">
        <div class="version-content">
          <el-icon class="version-icon"><SuccessFilled /></el-icon>
          <div class="version-info">
<h3>{{ t('home.versionTitle') }}</h3>
<p>Rshell - Cross-Platform C2 Framework</p>
<p class="version-note">{{ t('home.versionNote') }}</p>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { useRouter } from 'vue-router';
import {
  Connection,
  Download,
  Promotion,
  Monitor,
  Check,
  Position,
  ArrowRight,
  InfoFilled,
  Lock,
  MagicStick,
  Document,
  SuccessFilled
} from '@element-plus/icons-vue';

const router = useRouter();

const goToListener = () => {
  router.push('/Listeners');
};

const goToClient = () => {
  router.push('/Server');
};

const goToClients = () => {
  router.push('/Clients');
};
</script>

<style scoped>
.home-page {
  padding: 24px;
  min-height: calc(100vh - 60px);
  overflow-y: auto;
}

/* 欢迎横幅 */
.welcome-banner {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 20px;
  padding: 60px 40px;
  margin-bottom: 40px;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(0, 0, 0, 0.1);
}

.banner-content {
  text-align: center;
  position: relative;
  z-index: 1;
}

.welcome-title {
  font-size: 48px;
  font-weight: 700;
  margin: 0 0 16px 0;
  background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-dark) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 2px;
}

.welcome-subtitle {
  font-size: 20px;
  color: #666;
  margin: 0;
  font-weight: 500;
}

.banner-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.03));
}

.decoration-circle:nth-child(1) {
  width: 200px;
  height: 200px;
  top: -100px;
  right: -50px;
}

.decoration-circle:nth-child(2) {
  width: 150px;
  height: 150px;
  bottom: -75px;
  left: 20%;
}

.decoration-circle:nth-child(3) {
  width: 100px;
  height: 100px;
  top: 30%;
  left: -30px;
}

/* 章节标题 */
.section-title {
  text-align: center;
  margin-bottom: 32px;
}

.section-title h2 {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 12px 0;
  background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-dark) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-title p {
  font-size: 16px;
  color: #999;
  margin: 0;
}

/* 功能特性 */
.features-section {
  margin-bottom: 60px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.feature-card {
  border-radius: 20px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  transition: all 0.3s;
  cursor: default;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: var(--theme-light);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  font-size: 36px;
  color: var(--theme-primary);
}

.feature-title {
  font-size: 22px;
  font-weight: 600;
  color: var(--theme-primary);
  margin: 0 0 12px 0;
}

.feature-desc {
  font-size: 15px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.feature-list li .el-icon {
  color: #67c23a;
  font-size: 16px;
  flex-shrink: 0;
}

/* 快速开始 */
.quick-start-section {
  margin-bottom: 60px;
}

.steps-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 20px 0;
}

.step-card {
  flex: 1;
  max-width: 320px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  transition: all 0.3s;
}

.step-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
}

.step-number {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-dark) 100%);
  color: white;
  font-size: 28px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.step-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--theme-primary);
  margin: 0 0 12px 0;
}

.step-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 24px;
  min-height: 64px;
}

.step-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
}

.step-arrow {
  font-size: 32px;
  color: var(--theme-primary);
  flex-shrink: 0;
}

/* 使用技巧 */
.tips-section {
  margin-bottom: 60px;
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.tip-item {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s;
}

.tip-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.tip-icon {
  font-size: 32px;
  color: var(--theme-primary);
  margin-bottom: 16px;
}

.tip-item h4 {
  font-size: 18px;
  font-weight: 600;
  color: var(--theme-primary);
  margin: 0 0 12px 0;
}

.tip-item p {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0;
}

/* 版本信息 */
.version-section {
  margin-bottom: 40px;
}

.version-card {
  border-radius: 20px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
}

.version-content {
  display: flex;
  align-items: center;
  gap: 24px;
}

.version-icon {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: var(--theme-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  color: var(--theme-primary);
  flex-shrink: 0;
}

.version-info {
  flex: 1;
}

.version-info h3 {
  font-size: 24px;
  font-weight: 600;
  color: var(--theme-primary);
  margin: 0 0 8px 0;
}

.version-info p {
  font-size: 15px;
  color: #666;
  margin: 4px 0;
  line-height: 1.6;
}

.version-note {
  font-size: 14px;
  color: #999;
  font-style: italic;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .features-grid {
    grid-template-columns: 1fr;
  }

  .tips-grid {
    grid-template-columns: 1fr;
  }

  .steps-container {
    flex-direction: column;
  }

  .step-arrow {
    transform: rotate(90deg);
    margin: 10px 0;
  }

  .step-card {
    max-width: 100%;
    width: 100%;
  }
}

@media (max-width: 768px) {
  .home-page {
    padding: 16px;
  }

  .welcome-banner {
    padding: 40px 24px;
  }

  .welcome-title {
    font-size: 32px;
  }

  .welcome-subtitle {
    font-size: 16px;
  }

  .section-title h2 {
    font-size: 24px;
  }

  .section-title p {
    font-size: 14px;
  }

  .features-grid,
  .tips-grid {
    grid-template-columns: 1fr;
  }

  .version-content {
    flex-direction: column;
    text-align: center;
  }

  .step-card {
    padding: 24px;
  }
}

@media (max-width: 480px) {
  .welcome-title {
    font-size: 28px;
  }

  .feature-icon {
    width: 60px;
    height: 60px;
    font-size: 28px;
  }

  .step-number {
    width: 50px;
    height: 50px;
    font-size: 24px;
  }
}
</style>