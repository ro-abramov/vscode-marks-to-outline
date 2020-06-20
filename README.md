# Marks to outline

Add MARK symbols in comments to outline view.

[![image](/images/example.png)](image)

React hooks are awesome, but what I really don't like about them, is that sometimes it takes some time to scroll to actual render. At first I've created this extension to quickly jump to return. But later I've found myself putting MARKS in other places too. I still think that it is better to split large code blocks into multiple files, and keep them nice and short, but if this is not the case just use MARKS to add logical grouping to code.

## How To Use

Add `MARK: -` or your custom keyword to one line comment.

```javascript
// MARK: -This is my comment that would be shown in outline
```

## Configuration

```js
{
  "marksToOutline.mark": "MARK: -", // Keyword to look for
  "marksToOutline.highlightMarks": true, // should highlight lines or not
  "marksToOutline.darkColor": "hsla(0, 100%, 100%, 0.07)", // higlight color for dark themes
  "marksToOutline.lightColor": "hsla(0, 0%, 0%, 0.07)" // highlight color for light themes
}
```

## Change log

See Change log [here](CHANGELOG.md)
