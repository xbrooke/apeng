// 初始化主题切换功能
function initThemeToggle() {
  const themeSwitch = document.getElementById('theme-switch');
  if (!themeSwitch) return;
  
  // 检查本地存储中的主题设置
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isWechatBrowser = isInWechat();
  
  // 设置初始主题
  let currentTheme;
  if (savedTheme) {
    currentTheme = savedTheme;
  } else {
    // 如果在微信内，直接使用深色模式；否则检测系统设置
    currentTheme = isWechatBrowser ? 'dark' : (systemPrefersDark ? 'dark' : 'light');
  }
  
  setTheme(currentTheme);
  
  // 切换主题开关点击事件
  themeSwitch.addEventListener('click', () => {
    const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  });
  
  // 键盘支持 (Enter 或 Space)
  themeSwitch.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      themeSwitch.click();
    }
  });
  
  // 触摸设备支持
  themeSwitch.addEventListener('touchstart', () => {
    themeSwitch.style.opacity = '0.7';
  });
  
  themeSwitch.addEventListener('touchend', () => {
    themeSwitch.style.opacity = '1';
  });
  
  // 监听系统主题变化
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    // 只有在用户没有手动设置主题时才跟随系统变化
    if (!localStorage.getItem('theme')) {
      const newTheme = e.matches ? 'dark' : 'light';
      setTheme(newTheme);
    }
  });
  
  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    // 更新aria-label以反映当前状态
    const newLabel = theme === 'dark' ? '切换浅色模式' : '切换深色模式';
    themeSwitch.setAttribute('aria-label', newLabel);
  }
}

// 检测是否在微信内部浏览器中
function isInWechat() {
  const ua = navigator.userAgent.toLowerCase();
  return /micromessenger/.test(ua);
}

// 初始化微信跳转功能
function initWechatJump() {
  const jumpBtn = document.getElementById('wechat-jump-btn');
  if (jumpBtn) {
    jumpBtn.addEventListener('click', () => {
      // 检查是否在微信内部浏览器
      if (isInWechat()) {
        // 在微信内部，无法跳转应用，提示用户在浏览器中打开
        showWechatInternalTip();
      } else {
        // 在浏览器中，可以正常跳转
        performWechatJump();
      }
    });
    
    // 键盘支持
    jumpBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        jumpBtn.click();
      }
    });
  }
}

// 在微信内部时的提示方案
function showWechatInternalTip() {
  const message = `你在微信内部打开了本页面。<br><br>
请使用右上角菜单，选择「在浏览器中打开」或「用系统浏览器打开」，<br>
然后点击按钮即可直接跳转到微信添加页面。<br><br>
或者，你也可以在微信中长按下方二维码识别，<br>
或者直接搜索：<strong>${wechatConfig.username}</strong>`;
  
  showCustomModal('提示', message, [{text: '关闭'}]);
}

// 自定义弹窗提示
function showCustomModal(title, message, buttons = [{text: '确定', callback: null}]) {
  // 创建模态框容器
  const modal = document.createElement('div');
  modal.className = 'custom-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  
  // 创建背景遮罩
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  
  // 创建内容容器
  const content = document.createElement('div');
  content.className = 'modal-content';
  
  // 标题
  const titleEl = document.createElement('h2');
  titleEl.className = 'modal-title';
  titleEl.textContent = title;
  
  // 消息
  const messageEl = document.createElement('p');
  messageEl.className = 'modal-message';
  messageEl.innerHTML = message;
  
  // 按钮容器
  const buttonsContainer = document.createElement('div');
  buttonsContainer.className = 'modal-buttons';
  
  // 添加按钮
  buttons.forEach((btn, index) => {
    const button = document.createElement('button');
    button.className = 'modal-button';
    if (index === buttons.length - 1) button.classList.add('primary');
    button.textContent = btn.text;
    button.addEventListener('click', () => {
      if (btn.callback) btn.callback();
      document.body.removeChild(modal);
    });
    buttonsContainer.appendChild(button);
  });
  
  // 组装弹窗
  content.appendChild(titleEl);
  content.appendChild(messageEl);
  content.appendChild(buttonsContainer);
  modal.appendChild(overlay);
  modal.appendChild(content);
  
  // 添加到页面
  document.body.appendChild(modal);
  
  // 点击背景关闭
  overlay.addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
  // 聚焦第一个按钮
  buttonsContainer.querySelector('button').focus();
}

// 在浏览器中的跳转方案
function performWechatJump() {
  // 最优方案：安卓上使用微信分享功能
  // 谷歌/苹果浏览器上使用 URI Scheme
  // 作为最后降级：提示用户手动搜索
  
  const timeout = 2000;
  let hasResponded = false;
  
  // 检测是何种设备/浏览器
  const ua = navigator.userAgent.toLowerCase();
  const isAndroid = /android/.test(ua);
  const isIOS = /iphone|ipad|ipod/.test(ua);
  const isWeixin = /micromessenger/.test(ua);
  
  // 监听页面可见性变化
  const handleVisibilityChange = () => {
    if (document.hidden) {
      hasResponded = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimeout(fallbackTimer);
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // 根据设备类型选择不同的跳转方案
  let jumpUrl = '';
  
  if (isAndroid) {
    // Android：优先使用 Intent Scheme
    // intent://profile/username/{username}#Intent;scheme=weixin;package=com.tencent.mm;end
    // 或使用前端上的 URI Scheme
    jumpUrl = `weixin://contacts/profile/send/?username=${wechatConfig.username}`;
  } else if (isIOS) {
    // iOS：使用 weixin:// scheme
    jumpUrl = `weixin://contacts/profile/send/?username=${wechatConfig.username}`;
  }
  
  // 尝试跳转
  if (jumpUrl) {
    window.location.href = jumpUrl;
  }
  
  // 如果超过超时时间仍未切换应用，使用降级方案
  const fallbackTimer = setTimeout(() => {
    if (!hasResponded) {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      showFallbackOptions();
    }
  }, timeout);
}

// 降级方案：提供多种选择
function showFallbackOptions() {
  const message = `微信未URI响应<br><br>
推荐方案：<br>
<strong>1. 扫描二维码</strong> ：会自动跳转添加我<br>
<strong>2. 在微信中搜索</strong>：搜索手机号 <strong>${wechatConfig.username}</strong><br>
<strong>3. 复制微信号</strong>：号码已复制，在微信中粘贴`;
  
  // 尝试复制微信号
  if (navigator.clipboard) {
    navigator.clipboard.writeText(wechatConfig.username);
  }
  
  showCustomModal('提示', message, [{text: '关闭'}]);
}

// 初始化复制功能
function initCopyButton() {
  const copyBtn = document.getElementById('wechat-need-reply-copybtn');
  const copyText = document.getElementById('wechat-need-reply-text');
  
  if (copyBtn && copyText) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(defaultReplyText);
        const originalText = copyText.textContent;
        copyText.textContent = copyConfig.successText;
        copyBtn.style.color = copyConfig.successColor;
        
        setTimeout(() => {
          copyText.textContent = originalText;
          copyBtn.style.color = '';
        }, copyConfig.resetDelay);
      } catch (err) {
        const originalText = copyText.textContent;
        copyText.textContent = copyConfig.failText;
        copyBtn.style.color = copyConfig.failColor;
        
        setTimeout(() => {
          copyText.textContent = originalText;
          copyBtn.style.color = '';
        }, copyConfig.resetDelay);
      }
    });
    
    // 键盘支持
    copyBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        copyBtn.click();
      }
    });
  }
}

// 初始化微信号复制功能
function initWechatIdCopy() {
  const copyBtn = document.getElementById('wechat-id-copy-btn');
  const copyText = document.getElementById('wechat-id-copy-text');
  const idDisplay = document.getElementById('wechat-id-display');
  
  if (copyBtn && copyText && idDisplay) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(wechatConfig.username);
        const originalText = copyText.textContent;
        
        // 改变按钮样式为成功状态
        copyBtn.classList.add('copied');
        copyText.textContent = copyConfig.successText;
        
        setTimeout(() => {
          copyText.textContent = originalText;
          copyBtn.classList.remove('copied');
        }, copyConfig.resetDelay);
      } catch (err) {
        const originalText = copyText.textContent;
        
        // 改变按钮样式为失败状态
        copyBtn.classList.add('failed');
        copyText.textContent = copyConfig.failText;
        
        setTimeout(() => {
          copyText.textContent = originalText;
          copyBtn.classList.remove('failed');
        }, copyConfig.resetDelay);
      }
    });
    
    // 键盘支持
    copyBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        copyBtn.click();
      }
    });
    
    // 使用 variables.js 中的配置更新显示的微信号
    idDisplay.textContent = wechatConfig.username;
  }
}

// 初始化所有功能
document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initWechatJump();
  initCopyButton();
  initWechatIdCopy();
  initQRCodeLongPress();
  updateOpenGraphMetaTags();
});

// 初始化二维码长按识别功能
function initQRCodeLongPress() {
  const qrcode = document.getElementById('wechat-qrcode');
  if (!qrcode) return;
  
  // 识别是否在微信中，如果是，添加提示文本
  if (isInWechat()) {
    const tipsText = document.querySelector('.tips');
    if (tipsText) {
      tipsText.innerHTML = '扫描或<strong>长按</strong>二维码添加微信';
    }
  }
  
  // 添加长按事件监听
  let pressTimer = null;
  const longPressDuration = 500;
  
  qrcode.addEventListener('touchstart', () => {
    pressTimer = setTimeout(() => {
      handleQRCodeLongPress();
    }, longPressDuration);
  });
  
  qrcode.addEventListener('touchend', () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
  });
  
  qrcode.addEventListener('touchcancel', () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
  });
}

// 处理二维码长按
function handleQRCodeLongPress() {
  if (isInWechat()) {
    console.log('二维码长按被检测，微信客户端会自动处理识别');
  }
}

// 处理二维码长按
function handleQRCodeLongPress() {
  if (isInWechat()) {
    console.log('二维码长按被检测，微信客户端会自动处理识别');
  }
}

// 动态更新 Open Graph 元标签
function updateOpenGraphMetaTags() {
  const pageUrl = window.location.href;
  // 使用绝对路径（从根开始）
  const imageUrl = '/img/icon.webp';
  
  // 动态更新页面 URL 和图片
  document.getElementById('og-url').setAttribute('content', pageUrl);
  document.getElementById('og-image').setAttribute('content', imageUrl);
  document.getElementById('twitter-url').setAttribute('content', pageUrl);
  document.getElementById('twitter-image').setAttribute('content', imageUrl);
  
  // 优化小红书跳转逻辑
  initXiaohongshuLink();
}

// 初始化小红书链接
function initXiaohongshuLink() {
  const xiaohongshuLink = document.querySelector('.social-link.xiaohongshu');
  if (xiaohongshuLink) {
    xiaohongshuLink.addEventListener('click', (e) => {
      // 检查是否在需要重向的浏览器中
      const ua = navigator.userAgent.toLowerCase();
      const isAndroid = /android/.test(ua);
      
      // 在 Android 设备上，江局与小红书 App 的应用不兼容
      if (isAndroid) {
        // 使用 intent scheme 调起小红书 App
        const appUrl = `intent://user/profile/65dc090d0000000005009711#Intent;scheme=xiaohongshu;package=com.xingin.xhs;end`;
        window.location.href = appUrl;
        
        // 降级：如果 App 没有下载，抗撤到不同的 URL
        setTimeout(() => {
          // 检查是否突然需要在浏览器中打开（稍后处理）
          const orgUrl = 'https://www.xiaohongshu.com/user/profile/65dc090d0000000005009711';
          // 优先尝试江局：应待处理一个平台验证或提稍
        }, 2000);
      } else {
        // iOS 或其他平台，直接使用提供的链接
        // 不需要阻止默认行为
      }
    });
  }
}
