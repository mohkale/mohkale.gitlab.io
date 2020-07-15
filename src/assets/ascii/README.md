ANT (Animated Ascii Art) files uses a syntax similair to [animascii](https://github.com/TheGreatRambler/AnimASCII.js) files.

The first character of each line, symbolises the semantic purpose of that line.

-: name of the animation. if ommited, will default to &lt;unknown&gt;
$: number of frames of the animation that should run per second. If given, it should be the first command in the file.
#: description and/or comments
": width & height as a number of lines and columns in the gif
|: number of frames the given frame should run for
,: number of milleseconds the given frame should run for
%: a line included in the current frame
@: an optional source, and or origin for the frame
+: stylesheet decleration for the current frame.
W: takes an argument number and will substitute that many lines of whitespace into the frame.
\: cut frame here. don't use this, instead just leave an empty line.
/: no-script frame. display this frame if you can't animate the gif. defaults to first frame. not 0 delimeted.

Any empty or whitespace characters will be interpreted as a break intended to seperate 2 or more frames. Any commands intended to work solely on one frame of the animation will operate on the next frame after this break.
