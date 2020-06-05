# Marks to outline

Add MARK symbols in comments to outline view.

[![image](/images/example.png)](image)

This package play nicely with awesome "TODO Highlight" package.

Just add to the settings.json

```json
  "todohighlight.keywords": [
    { "text": "MARK: -", "color": "inherit", "backgroundColor": "hsla(28, 100%, 35%, 0.2)", "isWholeLine": true }
  ]
```

## How To Use

Just add `MARK: -` to your one line comment.

```javascript
// MARK: -This is my comment that would be shown in outline
```

## Recommendation

## Versions history

### 0.0.1

Add basic support for pragma mark comments for typescript and javascript
