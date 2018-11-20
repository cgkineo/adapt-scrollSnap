# adapt-scrollSnap
An extension which hides the scrollbar and snaps the scroll position to blocks for large devices. Navigation based on swipe gestures, specific keyboard navigation, the mouse wheel, and an optional scroll button.

Content is set to fill the viewport height.

Please see this [**blog post**](https://cityandguilds.sharepoint.com/teamsite/kineo/blog/Lists/Posts/Post.aspx?List=37bf0d45%2D2bbd%2D477e%2Dbcec%2D4a062b36160e&ID=399&Web=60d71fc5%2D7c0e%2D4afe%2D9a3d%2Da4266202a7a9) for an example of how this has been used. 

## Settings Overview

**scrollSnap** is configured in *course.json*. The attributes are properly formatted as JSON in [*example.json*](https://github.com/cgkineo/adapt-scrollSnap/blob/master/example.json).

### Attributes

The following attributes are set within *course.json*:

**_scrollSnap** (object): The scrollSnap object that contains the configuration settings.

>**_isEnabled** (boolean): Turns the extension on/off. Acceptable values are `true` and `false`.

>**_useNavigationOffset** (boolean): Determines whether to use the navigation height to offset the content and scroll positions. Acceptable values are `true` and `false`. Set to `false` to fill the entire viewport height.

>**_scrollDuration** (number): The duration of the scroll transition.

>**_button** (object): The configuration setting for the scroll button.

>>**_isEnabled** (boolean): Turns the scroll button on/off. Acceptable values are `true` and `false`.

>>**label** (string): The label for the scroll button.

## Limitations

- Content is not set to explicitly fill the browser width. If required, additional styling should be added to the theme, as the look and feel will be dependant upon the Art Direction and plugins to be used.

- Not designed to work with a page-header. As the extension fills the viewport, all content should be added as components.

- Currently not setup to work with [**adapt-contrib-trickle**](https://github.com/adaptlearning/adapt-contrib-trickle).

- [**adapt-contrib-pageLevelProgress**](https://github.com/adaptlearning/adapt-contrib-) won't currently snap in the same way, instead scrolling the associated component into view.