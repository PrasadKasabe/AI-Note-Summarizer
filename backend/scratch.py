from youtube_transcript_api import YouTubeTranscriptApi
api = YouTubeTranscriptApi()
tl = api.list('gmvvaobm7eQ')
t_obj = list(tl)[0]
data = t_obj.fetch()
print(type(data))
item = data[0]
print(type(item))
print(dir(item))
print(item.text)
