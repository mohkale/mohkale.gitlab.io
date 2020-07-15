#!/usr/bin/python3
import re, json, sys
from math import ceil as ceiling
from request_mixin import RequestMixin

requester       = RequestMixin()
json_find_regex = re.compile(r'\s*animation\s?=\s?(\{.+\});', re.MULTILINE)

def fetch_ascii_config(url):
    soup = requester.make_soup_request(url)
    dest_script = soup.find_all('script')[-1]

    config = json_find_regex.search(str(dest_script))

    if not(config):
        raise Exception('unable to parse JSON config from HTML')

    return json.loads(config.groups()[0])

def duration_to_framecount(duration_ms, fps):
    return ceiling(duration_ms * fps / 1000)

def print_frame_dimensions(config, file):
    for frame in config['frames']:
        frame_lines = frame['text'].split('\n')
        height = len(frame_lines)
        width = max(map(len, frame_lines))

        print('%03d %03d' % (width, height), file=sys.stderr)

def _write_frame(frame, fd, min_width, min_height):
    frame_lines = frame['text'].split('\n')

    for line in frame_lines:
        fd.write('%:'+line)
        if min_width:
            fd.write((min_width - len(line)) * ' ')
        fd.write('\n')

    if min_height:
        fd.write((min_height - len(frame_lines)) * ('%:' + (min_width or 0) * ' ' + '\n'))

def convert_ascii_config(src, config, fps, fd, min_width, min_height, animation_size):
    fd.write('-: %s\n' % config['title'])
    fd.write('$: %d\n' % fps)
    fd.write('@: %s\n' % src)

    if animation_size:
        fd.write('\": %d %d\n' % tuple(animation_size))

    do_while = True  # init do while condition

    for frame in config['frames']:
        if do_while: do_while = False
        else:
            fd.write('\n')

        fd.write('|: %d\n' % duration_to_framecount(frame['duration'], fps))
        _write_frame(frame, fd, min_width, min_height)

if __name__ == '__main__':
    def parse_args():
        from argparse import ArgumentParser

        parser = ArgumentParser()

        parser.add_argument('source', help='url of animascii source page')
        parser.add_argument('-f', '--fps', type=int, default=5, help='number of frames per second')
        parser.add_argument('-o', '--output', metavar='FILE', default=sys.stdout, type=lambda X: open(X, 'w', encoding='utf8'), help='where to print data')
        parser.add_argument('-p', '--print-size', action='store_true', help='simply print the size in characters of each frame on each line')
        parser.add_argument('-s', '--size', nargs=2, type=int, default=(None, None), metavar=('WIDTH', 'HEIGHT'), help='specify a minimum size for each frame')
        parser.add_argument('-a', '--animation-size', nargs=2, type=int, metavar=('WIDTH', 'HEIGHT'), help='set animation-size annotation')

        args  = parser.parse_args()
        vargs = vars(args)

        return args, vargs, parser

    args, vargs, parser = parse_args()
    config = fetch_ascii_config(args.source)

    if args.print_size:
        print_frame_dimensions(config, file=sys.stderr)
    else:
        convert_ascii_config(args.source, config, args.fps, args.output, args.size[0], args.size[1], args.animation_size)
