/* eslint-disable object-curly-spacing */
/* eslint-disable space-before-function-paren */
/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */

import React, {useState, useEffect} from 'react'
import axios from 'axios'
import ReactAudioPlayer from 'react-audio-player'

function AudioRecorder() {
  const [recording, setRecording] = useState(false) // 녹음 여부
  const [mediaRecorder, setMediaRecorder] = useState(null) // stream을 녹음하는 객체
  const [audioChunks, setAudioChunks] = useState([])
  const [audioLevel, setAudioLevel] = useState(0) // 성량
  const [audioLevelCount, setAudioLevelCount] = useState(0) // 일정 수준 이하로 내려간 성량 count (=1/60)

  const [sourceNode, setSourceNode] = useState(null)
  const [analyserNode, setAnalyserNode] = useState(null)

  const [myChat, setMyChat] = useState(null)
  const [request, setRequest] = useState(null)

  useEffect(() => {
    if (mediaRecorder == null) return
    console.log('audioChuncks = ')
    console.log(audioChunks)
    const formData = new FormData()
    const audioBlob = new Blob(audioChunks, {type: 'audio/wav'})

    console.log('audioBlob = ')
    console.log(audioBlob)
    formData.append('audioBlob', audioBlob)
    formData.append('test', 'test')

    console.log('formData = ')
    for (const key of formData.entries()) {
      console.log(key)
    }

    axios({
      method: 'POST',
      // url: 'http://ai.zigdeal.shop/chat',
      url: 'http://127.0.0.1:5000/chat/transcribe',
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      data: formData
    }).then((response) => {
      console.log(response.data.result)
      setMyChat(response.data.result)

      const data = {
        text: response.data.result
      }

      axios({
        method: 'POST',
        // url: 'http://ai.zigdeal.shop/chat',
        url: 'http://127.0.0.1:5000/chat/askGPT',
        headers: {
          'Content-Type': 'application/json'
        },
        data
      }).then((response) => {
        setRequest(response.data.result)

        axios({
          method: 'POST',
          url: 'http://127.0.0.1:5000/chat/TTS',
          headers: {
            'Content-Type': 'application/json'
          },
          data: {text: response.data.result}
        }).then((response) => {
          console.log(response)
        })
      })
    })
  }, [audioChunks])

  useEffect(() => {
    if (audioLevelCount > 120 && mediaRecorder.state === 'recording') {
      stopRecording()
    }

    if (audioLevel < 30) setAudioLevelCount(audioLevelCount + 1)
    else setAudioLevelCount(0)
  }, [audioLevel])

  useEffect(() => {
    // create a new Uint8Array to store the frequency data
    if (recording === false) return
    if (mediaRecorder == null) return
    const dataArray = new Uint8Array(analyserNode.frequencyBinCount)

    function getAudioLevel() {
      analyserNode.getByteFrequencyData(dataArray)
      const avg =
        dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length
      setAudioLevel(avg)
      requestAnimationFrame(getAudioLevel)
    }
    requestAnimationFrame(getAudioLevel)
  }, [recording])

  const startRecording = async () => {
    const audioContext = new AudioContext()

    // get a MediaStream object from a user's microphone
    navigator.mediaDevices
      .getUserMedia({audio: true})
      .then((stream) => {
        setRecording(true)
        const mediaRecorder = new MediaRecorder(stream)
        setMediaRecorder(mediaRecorder)
        mediaRecorder.addEventListener('dataavailable', handleDataAvailable)

        mediaRecorder.start()

        // create a new MediaStreamAudioSourceNode object from the MediaStream
        const sourceNode = audioContext.createMediaStreamSource(stream)
        setSourceNode(sourceNode)

        // create a new AnalyserNode object
        const analyserNode = audioContext.createAnalyser()
        setAnalyserNode(analyserNode)
        analyserNode.fftSize = 256

        // connect the sourceNode to the analyserNode
        sourceNode.connect(analyserNode)
      })
      .catch((error) => {
        console.log(error)
      })
  }

  const stopRecording = async () => {
    if (!mediaRecorder) return
    mediaRecorder.stop()

    setRecording(false)
    console.log(
      'recording 종료 ============================================================='
    )
    sourceNode.disconnect()
    analyserNode.disconnect()
    console.log(
      'sourceNode & analyserNode disconnect ============================================================='
    )
    setAudioLevelCount(0)
  }

  const handleDataAvailable = (event) => {
    if (event.data.size > 0) {
      console.log('data-available')
      setAudioChunks((chunks) => [...chunks, event.data])
    }
  }

  const downloadAudio = () => {
    axios({
      method: 'POST',
      url: 'http://127.0.0.1:5000/speak'
    }).then((response) => {
      console.log(response)
    })
    // const audioBlob = new Blob(audioChunks, {type: 'audio/wav'})
    // console.log(audioBlob)
    // const audioUrl = URL.createObjectURL(audioBlob)
    // const link = document.createElement('a')
    // link.href = audioUrl
    // link.download = 'recording.wav'
    // link.click()
    // setAudioChunks([])
  }

  return (
    <div>
      <button onClick={startRecording} disabled={recording}>
        Start Recording
      </button>
      <button onClick={stopRecording} disabled={!recording}>
        Stop Recording
      </button>
      <button onClick={downloadAudio} disabled={audioChunks.length === 0}>
        Download Recording
      </button>
      <div>Audio Level: {audioLevel.toFixed(2)}</div>
      <div>내가 한 말 : {myChat}</div>
      <div>ChatGPT가 한 말 : {request}</div>
      {/* <ReactAudioPlayer src="http://127.0.0.1:5000/speak" autoPlay controls /> */}
    </div>
  )
}

export default AudioRecorder
