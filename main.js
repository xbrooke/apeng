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
  const message = `亲，你在微信内部打开了本页面。

请使用右上角菜单，选择「在浏览器中打开」或「用系统浏览器打开」，
然后点击按钮即可直接跳转到微信添加页面。

或者，你也可以在微信中直接搜索：${wechatConfig.username}`;
  alert(message);
}

// 在浏览器中的跳转方案
function performWechatJump() {
  // 微信URI Scheme的官方限制无法直接跳转到添加页面
  // 常用三种方案组合处理
  
  const timeout = 2000;
  let hasResponded = false;
  
  // 监听页面可见性变化（如果用户切换到微信应用，页面会隐藏）
  const handleVisibilityChange = () => {
    if (document.hidden) {
      hasResponded = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimeout(fallbackTimer);
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // 尝试方案：使用接触上业今信息API
  try {
    // 如果应用支持接触微信上业今信息
    const contactCard = `weixin://contacts/detail/username/${wechatConfig.username}`;
    window.location.href = contactCard;
  } catch (e) {
    console.log('上业今信息API不成功');
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
// 使用一个模态框或提示（比alert更正式）
function showFallbackOptions() {
  const message = `微信URI Scheme没有响应

请选择以下方式：

1. 扫描二维码→ 点下方加友
2. 会话窗口搜索：${wechatConfig.username}
3. 复制游客信息：（已为你批量复制）`;
  alert(message);
  
  // 为用户复制信息
  if (navigator.clipboard) {
    navigator.clipboard.writeText(wechatConfig.username).catch(err => {
      console.log('复制失败:', err);
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
