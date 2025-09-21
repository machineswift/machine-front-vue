<template>
  <div class="matrix-container">
    <div class="matrix-background"></div>
    <div class="content">
      <h1 class="error-code">404</h1>
      <h2 class="error-message">PAGE NOT FOUND</h2>
      <p class="error-description">The requested URL was not found on this server.</p>
      <button @click="goHome" class="home-button">
        <span class="button-text">返回首页</span>
        <span class="button-glitch"></span>
      </button>
    </div>
    <canvas ref="matrixCanvas" class="matrix-canvas"></canvas>
  </div>
</template>

<script lang="ts">
  import { defineComponent, onMounted, onBeforeUnmount, ref } from 'vue'
  import { useRouter } from 'vue-router'

  export default defineComponent({
    name: 'NotFoundPage',
    setup() {
      const router = useRouter()
      const matrixCanvas = ref<HTMLCanvasElement | null>(null)
      let animationId: number = 0
      let matrixInterval: number

      const goHome = () => {
        router.push('/home')
      }

      const initMatrix = () => {
        if (!matrixCanvas.value) return

        const canvas = matrixCanvas.value
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Set canvas size
        canvas.width = canvas.offsetWidth
        canvas.height = canvas.offsetHeight

        // Matrix characters
        const matrixChars =
          '01アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン'
        const fontSize = 16
        const columns = canvas.width / fontSize

        // Create drops
        const drops = ref<number[]>([])
        for (let i = 0; i < columns; i++) {
          drops[i] = 1
        }

        // Draw function
        const draw = () => {
          if (!ctx || !canvas) {
            return
          }

          // Black background with opacity
          ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
          ctx.fillRect(0, 0, canvas.width, canvas.height)

          // Set style for characters
          ctx.fillStyle = '#0f0'
          ctx.font = fontSize + 'px monospace'

          // Loop over drops
          for (let i = 0; i < drops.value.length; i++) {
            // Random character
            const text = matrixChars.charAt(Math.floor(Math.random() * matrixChars.length))

            // Draw character
            ctx.fillText(text, i * fontSize, drops[i]! * fontSize)

            // Reset drop at random intervals
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
              drops[i] = 0
            }

            // Move drop down
            drops[i]++
          }
        }

        // Clear previous interval if exists
        if (matrixInterval) {
          clearInterval(matrixInterval)
        }

        // Start animation
        matrixInterval = window.setInterval(draw, 33)
      }

      const handleResize = () => {
        if (matrixCanvas.value) {
          matrixCanvas.value.width = matrixCanvas.value.offsetWidth
          matrixCanvas.value.height = matrixCanvas.value.offsetHeight
        }
      }

      onMounted(() => {
        initMatrix()
        window.addEventListener('resize', handleResize)
      })

      onBeforeUnmount(() => {
        if (matrixInterval) {
          clearInterval(matrixInterval)
        }
        if (animationId) {
          cancelAnimationFrame(animationId)
        }
        window.removeEventListener('resize', handleResize)
      })

      return {
        matrixCanvas,
        goHome
      }
    }
  })
</script>

<style scoped>
  .matrix-container {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background-color: #000;
    color: #0f0;
    font-family: 'Courier New', monospace;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .matrix-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.3;
    z-index: 1;
  }

  .content {
    position: relative;
    z-index: 2;
    text-align: center;
    padding: 2rem;
    background-color: rgba(0, 0, 0, 0.7);
    border: 1px solid #0f0;
    box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
    max-width: 600px;
    width: 90%;
  }

  .error-code {
    font-size: 6rem;
    margin: 0;
    text-shadow:
      0 0 10px #0f0,
      0 0 20px #0f0;
    animation: glitch 1s linear infinite;
  }

  .error-message {
    font-size: 2rem;
    margin: 0.5rem 0;
    text-transform: uppercase;
    letter-spacing: 0.2em;
  }

  .error-description {
    margin: 1rem 0 2rem;
    line-height: 1.6;
  }

  .home-button {
    position: relative;
    background: transparent;
    color: #0f0;
    border: 1px solid #0f0;
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
    font-family: 'Courier New', monospace;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.3s;
  }

  .home-button:hover {
    background: rgba(0, 255, 0, 0.1);
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
  }

  .button-text {
    position: relative;
    z-index: 2;
  }

  .button-glitch {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(0, 255, 0, 0.3), transparent);
    transform: translateX(-100%);
    transition: transform 0.3s;
  }

  .home-button:hover .button-glitch {
    transform: translateX(100%);
  }

  @keyframes glitch {
    0%,
    100% {
      text-shadow:
        0.05em 0 0 rgba(255, 0, 0, 0.75),
        -0.05em -0.025em 0 rgba(0, 255, 0, 0.75),
        -0.025em 0.05em 0 rgba(0, 0, 255, 0.75);
    }
    14% {
      text-shadow:
        0.05em 0 0 rgba(255, 0, 0, 0.75),
        -0.05em -0.025em 0 rgba(0, 255, 0, 0.75),
        -0.025em 0.05em 0 rgba(0, 0, 255, 0.75);
    }
    15% {
      text-shadow:
        -0.05em -0.025em 0 rgba(255, 0, 0, 0.75),
        0.025em 0.025em 0 rgba(0, 255, 0, 0.75),
        -0.05em -0.05em 0 rgba(0, 0, 255, 0.75);
    }
    49% {
      text-shadow:
        -0.05em -0.025em 0 rgba(255, 0, 0, 0.75),
        0.025em 0.025em 0 rgba(0, 255, 0, 0.75),
        -0.05em -0.05em 0 rgba(0, 0, 255, 0.75);
    }
    50% {
      text-shadow:
        0.025em 0.05em 0 rgba(255, 0, 0, 0.75),
        0.05em 0 0 rgba(0, 255, 0, 0.75),
        0 -0.05em 0 rgba(0, 0, 255, 0.75);
    }
    99% {
      text-shadow:
        0.025em 0.05em 0 rgba(255, 0, 0, 0.75),
        0.05em 0 0 rgba(0, 255, 0, 0.75),
        0 -0.05em 0 rgba(0, 0, 255, 0.75);
    }
  }
</style>
