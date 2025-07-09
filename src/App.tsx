import { useState, useEffect } from 'react'
import { blink } from './blink/client'
import { Button } from './components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Textarea } from './components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select'
import { Badge } from './components/ui/badge'
import { Progress } from './components/ui/progress'
import { Sparkles, Download, Wand2, Image as ImageIcon, Zap, Video } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { Switch } from './components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'

interface GeneratedImage {
  id: string
  url: string
  prompt: string
  timestamp: Date
}

function App() {
  const [user, setUser] = useState<{ email: string; id: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [selectedStyle, setSelectedStyle] = useState('artistic')
  const [selectedSize, setSelectedSize] = useState('1024x1024')
  const [matureContent, setMatureContent] = useState(false)
  const [videoPrompt, setVideoPrompt] = useState('')
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false)

  const styles = [
    { id: 'artistic', label: 'Artistic', description: 'Beautiful artistic style' },
    { id: 'realistic', label: 'Realistic', description: 'Photorealistic rendering' },
    { id: 'anime', label: 'Anime', description: 'Anime-inspired style' },
    { id: 'vintage', label: 'Vintage', description: 'Retro aesthetic' },
    { id: 'glamour', label: 'Glamour', description: 'High-fashion glamour' }
  ]

  const sizes = [
    { id: '1024x1024', label: '1:1 Square', description: '1024×1024' },
    { id: '1024x1792', label: '9:16 Portrait', description: '1024×1792' },
    { id: '1792x1024', label: '16:9 Landscape', description: '1792×1024' }
  ]

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt')
      return
    }

    setIsGenerating(true)
    try {
      const stylePrefix = matureContent
        ? 'boudoir photography, sensual, alluring, intimate portrait, '
        : {
          'artistic': 'artistic portrait of a beautiful woman in swimwear, ',
          'realistic': 'photorealistic portrait of a beautiful woman in swimwear, ',
          'anime': 'anime-style beautiful woman in swimwear, ',
          'vintage': 'vintage pin-up style beautiful woman in swimwear, ',
          'glamour': 'glamorous high-fashion portrait of a beautiful woman in swimwear, '
        }[selectedStyle]

      const fullPrompt = `${stylePrefix}${prompt}, ${matureContent ? 'detailed skin texture, hyperrealistic' : 'high quality, detailed, professional lighting, elegant pose, tasteful, artistic'}`

      const result = await blink.ai.generateImage({
        prompt: fullPrompt,
        size: selectedSize as '1024x1024' | '1024x1792' | '1792x1024',
        quality: 'high',
        n: 1
      })

      if (result.data && result.data.length > 0) {
        const newImage: GeneratedImage = {
          id: Date.now().toString(),
          url: result.data[0].url,
          prompt: prompt,
          timestamp: new Date()
        }
        setGeneratedImages(prev => [newImage, ...prev])
        toast.success('Image generated successfully!')
      }
    } catch (err) {
      console.error('Error generating image:', err)
      toast.error('Failed to generate image')
    } finally {
      setIsGenerating(false)
    }
  }

  const generateVideo = async () => {
    if (!videoPrompt.trim()) {
      toast.error('Please enter a video prompt');
      return;
    }
    setIsGeneratingVideo(true);
    toast('🎬 Starting video generation...', { icon: '👏' });

    // Simulate generation time
    await new Promise(resolve => setTimeout(resolve, 5000));

    setIsGeneratingVideo(false);
    toast.error('Video generation feature is coming soon!');
  }

  const downloadImage = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Image downloaded!')
    } catch {
      toast.error('Failed to download image')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              AI Girl Generator
            </CardTitle>
            <CardDescription>
              Create stunning AI-generated portraits with advanced machine learning
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">Please sign in to start generating images</p>
            <Button onClick={() => blink.auth.login()} className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
              Sign In to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  AI Girl Generator
                </h1>
                <p className="text-sm text-gray-600">Create stunning AI portraits</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700">
                <Zap className="h-3 w-3 mr-1" />
                {user.email}
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => blink.auth.logout()}
                className="border-pink-200 text-pink-700 hover:bg-pink-50"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="image" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-pink-100/80">
            <TabsTrigger value="image"><Wand2 className="h-4 w-4 mr-2" /> Image Generation</TabsTrigger>
            <TabsTrigger value="video"><Video className="h-4 w-4 mr-2" /> Video Generation</TabsTrigger>
          </TabsList>
          <TabsContent value="image">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Generation Panel */}
              <div className="space-y-6">
                <Card className="bg-white/80 backdrop-blur-sm border-pink-100">
                  <CardHeader>
                    <CardTitle className="flex items-center text-gray-800">
                      <Wand2 className="h-5 w-5 mr-2 text-pink-600" />
                      Generate Image
                    </CardTitle>
                    <CardDescription>
                      Describe your vision and let AI bring it to life
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Prompt
                      </label>
                      <Textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="beach setting, summer vibes, confident pose, sunset lighting..."
                        className="min-h-[100px] resize-none border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Style
                        </label>
                        <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                          <SelectTrigger className="border-pink-200 focus:border-pink-400">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {styles.map((style) => (
                              <SelectItem key={style.id} value={style.id}>
                                <div>
                                  <div className="font-medium">{style.label}</div>
                                  <div className="text-xs text-gray-500">{style.description}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Size
                        </label>
                        <Select value={selectedSize} onValueChange={setSelectedSize}>
                          <SelectTrigger className="border-pink-200 focus:border-pink-400">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {sizes.map((size) => (
                              <SelectItem key={size.id} value={size.id}>
                                <div>
                                  <div className="font-medium">{size.label}</div>
                                  <div className="text-xs text-gray-500">{size.description}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 bg-pink-50 p-3 rounded-lg border border-pink-200">
                      <Switch id="mature-content" checked={matureContent} onCheckedChange={setMatureContent} />
                      <div>
                        <label htmlFor="mature-content" className="font-medium text-gray-800">Mature Content</label>
                        <p className="text-xs text-gray-600">Enable for more artistic and suggestive themes.</p>
                      </div>
                    </div>

                    <Button 
                      onClick={generateImage}
                      disabled={isGenerating || !prompt.trim()}
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate Image
                        </>
                      )}
                    </Button>

                    {isGenerating && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Creating your image...</span>
                          <span>Please wait</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Tips */}
                <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-gray-800">💡 Pro Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm text-gray-700">
                      <p>• Be specific about pose, lighting, and setting</p>
                      <p>• Try different styles for unique results</p>
                      <p>• Use descriptive words for better quality</p>
                      <p>• Experiment with different aspect ratios</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Generated Images */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <ImageIcon className="h-5 w-5 mr-2 text-pink-600" />
                    Generated Images
                  </h2>
                  {generatedImages.length > 0 && (
                    <Badge variant="secondary" className="bg-pink-100 text-pink-700">
                      {generatedImages.length} image{generatedImages.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>

                <div className="space-y-4">
                  <AnimatePresence>
                    {generatedImages.length === 0 ? (
                      <Card className="bg-white/60 backdrop-blur-sm border-dashed border-pink-200">
                        <CardContent className="pt-12 pb-12 text-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ImageIcon className="h-8 w-8 text-pink-400" />
                          </div>
                          <p className="text-gray-500 text-lg">No images generated yet</p>
                          <p className="text-gray-400 text-sm mt-2">
                            Enter a prompt and click generate to create your first image
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      generatedImages.map((image) => (
                        <motion.div
                          key={image.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="group"
                        >
                          <Card className="bg-white/80 backdrop-blur-sm border-pink-100 overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="relative">
                              <img
                                src={image.url}
                                alt={image.prompt}
                                className="w-full h-auto object-cover"
                              />
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => downloadImage(image.url, `ai-girl-${image.id}`)}
                                  className="bg-white/90 hover:bg-white shadow-lg"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-sm text-gray-700 font-medium mb-1">
                                    "{image.prompt}"
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {image.timestamp.toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="video">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Video Generation Panel */}
              <div className="space-y-6">
                <Card className="bg-white/80 backdrop-blur-sm border-pink-100">
                  <CardHeader>
                    <CardTitle className="flex items-center text-gray-800">
                      <Video className="h-5 w-5 mr-2 text-pink-600" />
                      Generate Video
                    </CardTitle>
                    <CardDescription>
                      Create short video clips from a text description. This feature is experimental.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Video Prompt
                      </label>
                      <Textarea
                        value={videoPrompt}
                        onChange={(e) => setVideoPrompt(e.target.value)}
                        placeholder="a woman dancing on the beach at sunset..."
                        className="min-h-[100px] resize-none border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                      />
                    </div>

                    <Button 
                      onClick={generateVideo}
                      disabled={isGeneratingVideo || !videoPrompt.trim()}
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                    >
                      {isGeneratingVideo ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Generating Video...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate 5s Video
                        </>
                      )}
                    </Button>

                    {isGeneratingVideo && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Rendering your video...</span>
                          <span>This may take a moment</span>
                        </div>
                        <Progress value={50} className="h-2" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Video Preview */}
              <div>
                <Card className="bg-white/60 backdrop-blur-sm border-dashed border-pink-200">
                  <CardContent className="pt-12 pb-12 text-center aspect-[16/9] flex flex-col justify-center items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Video className="h-8 w-8 text-pink-400" />
                    </div>
                    <p className="text-gray-500 text-lg">Video preview will appear here</p>
                    <p className="text-gray-400 text-sm mt-2">
                      Video generation is coming soon!
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App