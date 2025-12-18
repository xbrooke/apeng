// 初始化主题切换功能
function initThemeToggle() {
  const themeSwitch = document.getElementById('theme-switch');
  if (!themeSwitch) return;
  
  // 检查本地存储中的主题设置
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // 设置初始主题
  let currentTheme;
  if (savedTheme) {
    currentTheme = savedTheme;
  } else {
    currentTheme = systemPrefersDark ? 'dark' : 'light';
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

// 初始化微信跳转功能
function initWechatJump() {
  const jumpBtn = document.getElementById('wechat-jump-btn');
  if (jumpBtn) {
    jumpBtn.addEventListener('click', () => {
      window.location.href = `weixin://dl/business/?t=${wechatConfig.username}`;
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

// 初始化所有功能
document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initWechatJump();
  initCopyButton();
});
