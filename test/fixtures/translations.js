module.exports = {
  en: {
    hello: 'Hello ${name}',
    hello_alt: 'Hello <name>',
    you_get_a: 'You get a ${label} and you get a ${label}',
    malicious: '<script>alert("hi")</script> ${name}',
    malicious_key: 'Hello ${<script>alert("hi")</script>}',
    nested: {
      translation: 'string from nested translation'
    },
    safe_tags: {
      br: 'Hello<br>World',
      br_closed: 'Hello<br/>World',
      p: '<p>Par 1</p><p>Par 2</p>',
      em: '<em>So emphatic!</em>',
      strong: '<strong>What a strong statement</strong>'
    }
  }
};
