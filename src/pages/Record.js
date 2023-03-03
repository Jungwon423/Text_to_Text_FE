/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */

import React, { useState, useEffect } from 'react'

function AudioRecorder() {
  const [recording, setRecording] = useState(false)
  const [audioStream, setAudioStream] = useState(null)
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [audioChunks, setAudioChunks] = useState([])
  const [audioLevel, setAudioLevel] = useState(0)

  useEffect(() => {
    const updateAudioLevel = () => {
      if (!mediaRecorder) return
      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(audioStream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 32
      source.connect(analyser)
      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      analyser.getByteFrequencyData(dataArray)
      const average = dataArray.reduce((acc, curr) => acc + curr, 0) / bufferLength
      setAudioLevel(average)
      requestAnimationFrame(updateAudioLevel)
    }
    requestAnimationFrame(updateAudioLevel)
  }, [mediaRecorder, audioStream])

  const startRecording = async() => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setAudioStream(stream)
      setRecording(true)
      const mediaRecorder = new MediaRecorder(stream)
      setMediaRecorder(mediaRecorder)
      mediaRecorder.addEventListener('dataavailable', handleDataAvailable)
      mediaRecorder.start()
    } catch (err) {
      console.error('Failed to get user media', err)
    }
  }

  const stopRecording = () => {
    if (!mediaRecorder) return
    mediaRecorder.stop()
    setRecording(false)
    setAudioStream(null)
  }

  const handleDataAvailable = (event) => {
    if (event.data.size > 0) {
      setAudioChunks((chunks) => [...chunks, event.data])
    }
  }

  const downloadAudio = () => {
    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
    const audioUrl = URL.createObjectURL(audioBlob)
    const link = document.createElement('a')
    link.href = audioUrl
    link.download = 'recording.wav'
    link.click()
    setAudioChunks([])
  }

  // useEffect(() => {
  //   if (audioLevel < 20) {
  //     stopRecording()
  //   }
  // }, [audioLevel, stopRecording])

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
    </div>
  )
}

export default AudioRecorder
