document.addEventListener('DOMContentLoaded', function() {
  function replaceText(elementId, newText) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = newText;
    }
  }

  replaceText('wechatOA-name', oaConfig.name);
  replaceText('wechatOA-description', oaConfig.description);
  
  if (siteConfig.beian) {
    replaceText('web-beian', siteConfig.beian);
  }
});
