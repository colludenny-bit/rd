import struct
def get_video_size(filename):
    with open(filename, 'rb') as f:
        f.read(24) # skip ftyp
        f.read(8) # skip free
        chunk = f.read(8)
        # simplistic...
        pass
