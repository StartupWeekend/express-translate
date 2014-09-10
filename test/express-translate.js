var expect = require('chai').expect;
var FixedServer = require('fixed-server');
var request = require('request');
var httpUtils = require('request-mocha')(request);

var fixedServer = FixedServer.fromFile('./test/fixtures/fixed-server', {
  port: 1337
});

describe('Loading a page that is translated with express-translate', function () {
  describe('when req.locale is set', function () {
    fixedServer.run(['GET 200 /#has-locale']);
    httpUtils.save('http://localhost:1337/');

    it('should translate strings in the view', function () {
      expect(this.body).to.contain('<p>Hello World</p>');
    });

    it('should allow translating from the request object', function () {
      expect(this.body).to.contain('<p>Hello Joe</p>');
    });
  });

  describe('when req.locale is undefined', function () {
    fixedServer.run(['GET 200 /#no-locale']);
    httpUtils.save('http://localhost:1337/');

    it('should display the translation key', function () {
      expect(this.body).to.eql('<p>hello</p><p>hello</p>');
    });
  });

  describe('when a localeKey setting is passed to express-translate', function () {
    fixedServer.run(['GET 200 /#locale-key']);
    httpUtils.save('http://localhost:1337/');

    it('should grab the user language from the specified key', function () {
      expect(this.body).to.eql('<p>Hello World</p><p>Hello Joe</p>');
    });
  });

  describe('when the translation has multiple placeholder keys of the same name', function () {
    fixedServer.run(['GET 200 /multiple-keys']);
    httpUtils.save('http://localhost:1337/multiple-keys');

    it('should interpolate values into both placeholders', function () {
      expect(this.body).to.eql('<p>You get a prize and you get a prize</p>');
    });
  });

  describe('when the translation has malicious interpolated values', function () {
    fixedServer.run(['GET 200 /escape-values']);
    httpUtils.save('http://localhost:1337/escape-values');

    it('should escape the html when `whitelistedKeys` is not set for the associated key', function () {
      expect(this.body).to.contain('<p>Hello &lt;script&gt;alert(&quot;hi&quot;)&lt;/script&gt;</p>');
    });

    it('should not escape the html when `whitelistedKeys` is set for the associated key', function () {
      expect(this.body).to.contain('<p>Hello <script>alert("bye")</script>');
    });
  });

  describe('when the translation has malicious interpolation keys', function () {
    fixedServer.run(['GET 200 /escape-key']);
    httpUtils.save('http://localhost:1337/escape-key');

    it('should escape the key', function () {
      expect(this.body).to.eql('<p>Hello ${&lt;script&gt;alert(&quot;hi&quot;)&lt;/script&gt;}</p>');
    });
  });

  describe('when the translation has malicious content', function () {
    fixedServer.run(['GET 200 /escape-translation']);
    httpUtils.save('http://localhost:1337/escape-translation');

    it('should escape the translation html but not the interpolated values', function () {
      expect(this.body).to.contain('<p>&lt;script&gt;alert(&quot;hi&quot;)&lt;/script&gt; &lt;script&gt;alert(&quot;hi&quot;)&lt;/script&gt;</p>');
      expect(this.body).to.contain('<p>&lt;script&gt;alert(&quot;hi&quot;)&lt;/script&gt; <script>alert("bye")</script>');
    });
  });

  describe('when a new interpolation prefix/suffix are defined in the settings', function () {
    describe('using html chars (< and >)', function () {
      fixedServer.run(['GET 200 /interpolation-setting']);
      httpUtils.save('http://localhost:1337/interpolation-setting');

      it('should interpolate values correctly', function () {
        expect(this.body).to.contain('<p>Hello World</p>');
      });
    });
  });

  describe('when the translation calls for a nested string key', function () {
    fixedServer.run(['GET 200 /nested-keys']);
    httpUtils.save('http://localhost:1337/nested-keys');

    it('should load the correct translation', function () {
      expect(this.body).to.contain('<p>string from nested translation</p>');
    });
  });

  describe('when a default string is provided', function () {
    fixedServer.run(['GET 200 /default-string']);
    httpUtils.save('http://localhost:1337/default-string');

    describe('and a translation is found', function () {
      it('should ignore the default string and return the translation', function () {
        expect(this.body).to.contain('<p>Hello Default String</p>');
      });
    });

    describe('and a translation is not found', function () {
      it('should return the default string', function () {
        expect(this.body).to.contain('<p>Default String in lieu of translation</p>');
      });
    });
  });

  describe('when using safe tags in your translations', function () {
    fixedServer.run(['GET 200 /safe-tags']);
    httpUtils.save('http://localhost:1337/safe-tags');

    describe("such as a br tag", function () {
      it('should leave the unclosed tag in the resulting translation', function () {
        expect(this.body).to.contain('<p>Hello<br>World</p>');
      });

      it('should leave the self-closing tag in the result', function () {
        expect(this.body).to.contain('Hello<br/>World</p>');
      });

      it('should leave paragraph tags', function () {
        expect(this.body).to.contain('<p>Par 1</p><p>Par 2</p>');
      });

      it('should leave em tags', function () {
        expect(this.body).to.contain('<em>So emphatic!</em>');
      });

      it('should leave strong tags', function () {
        expect(this.body).to.contain('<strong>What a strong statement</strong>');
      });
    });
  });
});
