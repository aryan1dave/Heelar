import { useState, useEffect, useRef } from 'react'

function App() {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState('client')
  const [formSubmitted, setFormSubmitted] = useState(false)

  // Modal functions
  const openModal = (type = 'client') => {
    setModalType(type)
    setModalOpen(true)
    setFormSubmitted(false)
    document.body.classList.add('modal-open')
  }

  const closeModal = () => {
    setModalOpen(false)
    document.body.classList.remove('modal-open')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Here you would send data to backend
    setFormSubmitted(true)
    setTimeout(() => {
      closeModal()
    }, 3000)
  }

  // Escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') closeModal()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  // Scroll reveal animations
  useEffect(() => {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
        }
      })
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -60px 0px'
    })

    document.querySelectorAll('.reveal, .reveal-scale, .reveal-left, .reveal-right, .animate-on-scroll').forEach(el => {
      revealObserver.observe(el)
    })

    return () => revealObserver.disconnect()
  }, [])

  // Smooth scroll for anchor links
  useEffect(() => {
    const handleAnchorClick = function(e) {
      const href = this.getAttribute('href')
      if (href === '#') return
      
      const target = document.querySelector(href)
      if (target) {
        e.preventDefault()
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', handleAnchorClick)
    })

    return () => {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.removeEventListener('click', handleAnchorClick)
      })
    }
  }, [])

  // About section - Scene-based animations
  useEffect(() => {
    const textSections = document.querySelectorAll('.about-stripe-text')
    const scenes = document.querySelectorAll('.stripe-scene')
    const dots = document.querySelectorAll('.stripe-dot')
    
    if (!textSections.length || !scenes.length) return

    let currentIndex = 0

    const updateScene = (index) => {
      if (index === currentIndex) return
      currentIndex = index
      
      scenes.forEach((scene, i) => {
        scene.classList.toggle('active', i === index)
      })
      
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index)
      })
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.dataset.index)
          updateScene(index)
        }
      })
    }, {
      threshold: 0.5,
      rootMargin: '-25% 0px -25% 0px'
    })

    textSections.forEach((section) => {
      observer.observe(section)
    })

    // Dot click navigation
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        textSections[index].scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        })
      })
    })

    return () => observer.disconnect()
  }, [])

  // Practitioners section scroll
  useEffect(() => {
    const section = document.querySelector('.practitioners-section')
    const container = document.querySelector('.practitioners-sticky-container')
    const slidesWrapper = document.querySelector('.practitioners-slides')
    const slides = document.querySelectorAll('.practitioners-slide')
    const dotsContainer = document.querySelector('.practitioners-dots')
    
    if (!section || !container || !slidesWrapper || !slides.length) return

    let currentSlide = 0
    let touchStartX = 0
    let touchEndX = 0
    let isDragging = false

    const isMobile = () => window.innerWidth <= 1024

    const updateSlide = (index, animate = true) => {
      currentSlide = index
      
      if (isMobile() && slidesWrapper) {
        slidesWrapper.style.transition = animate ? 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)' : 'none'
        slidesWrapper.style.transform = `translateX(-${index * 100}%)`
      }
      
      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index)
      })
      
      if (dotsContainer) {
        dotsContainer.querySelectorAll('.dot').forEach((dot, i) => {
          dot.classList.toggle('active', i === index)
        })
      }
    }

    // Touch events for mobile
    if (isMobile()) {
      slidesWrapper.addEventListener('touchstart', (e) => {
        if (!isMobile()) return
        isDragging = true
        touchStartX = e.touches[0].screenX
      }, { passive: true })

      slidesWrapper.addEventListener('touchmove', (e) => {
        if (!isMobile() || !isDragging) return
        touchEndX = e.changedTouches[0].screenX
        
        const diff = touchStartX - touchEndX
        const baseOffset = currentSlide * 100
        const dragOffset = (diff / window.innerWidth) * 100
        const maxDrag = 20
        
        let newOffset = baseOffset + dragOffset
        if (currentSlide === 0 && dragOffset < 0) {
          newOffset = baseOffset + Math.max(dragOffset, -maxDrag)
        }
        if (currentSlide === slides.length - 1 && dragOffset > 0) {
          newOffset = baseOffset + Math.min(dragOffset, maxDrag)
        }
        
        slidesWrapper.style.transition = 'none'
        slidesWrapper.style.transform = `translateX(-${newOffset}%)`
      }, { passive: true })

      slidesWrapper.addEventListener('touchend', (e) => {
        if (!isMobile() || !isDragging) return
        touchEndX = e.changedTouches[0].screenX
        isDragging = false
        
        const swipeThreshold = 50
        const diff = touchStartX - touchEndX
        
        if (Math.abs(diff) > swipeThreshold) {
          if (diff > 0 && currentSlide < slides.length - 1) {
            updateSlide(currentSlide + 1)
          } else if (diff < 0 && currentSlide > 0) {
            updateSlide(currentSlide - 1)
          } else {
            updateSlide(currentSlide)
          }
        } else {
          updateSlide(currentSlide)
        }
      }, { passive: true })
    }

    // Desktop scroll
    let ticking = false
    
    const handleScroll = () => {
      if (isMobile()) return
      
      if (!ticking) {
        requestAnimationFrame(() => {
          const rect = section.getBoundingClientRect()
          const sectionHeight = container.offsetHeight
          const viewportHeight = window.innerHeight
          
          const scrollProgress = -rect.top / (sectionHeight - viewportHeight)
          const clampedProgress = Math.max(0, Math.min(1, scrollProgress))
          
          const slideIndex = Math.min(
            Math.floor(clampedProgress * slides.length),
            slides.length - 1
          )
          
          if (slideIndex !== currentSlide) {
            updateSlide(slideIndex)
          }
          
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Explore carousel auto-scroll
  useEffect(() => {
    const wrapper = document.querySelector('.explore-scroll-wrapper')
    if (!wrapper) return

    let scrollSpeed = 0.5
    let isPaused = false
    let animationId = null
    let isDown = false
    let startX
    let scrollLeft

    const autoScroll = () => {
      if (!isPaused && !isDown) {
        wrapper.scrollLeft += scrollSpeed
        
        if (wrapper.scrollLeft >= wrapper.scrollWidth / 2) {
          wrapper.scrollLeft = 0
        }
      }
      animationId = requestAnimationFrame(autoScroll)
    }

    animationId = requestAnimationFrame(autoScroll)

    let resumeTimeout
    const pauseAnimation = () => {
      isPaused = true
      if (resumeTimeout) clearTimeout(resumeTimeout)
    }

    const resumeAfterDelay = () => {
      if (resumeTimeout) clearTimeout(resumeTimeout)
      resumeTimeout = setTimeout(() => {
        isPaused = false
      }, 2000)
    }

    // Mouse events
    wrapper.addEventListener('mousedown', (e) => {
      isDown = true
      wrapper.style.cursor = 'grabbing'
      startX = e.pageX - wrapper.offsetLeft
      scrollLeft = wrapper.scrollLeft
      pauseAnimation()
    })

    wrapper.addEventListener('mouseleave', () => {
      if (isDown) {
        isDown = false
        wrapper.style.cursor = 'grab'
        resumeAfterDelay()
      }
    })

    wrapper.addEventListener('mouseup', () => {
      isDown = false
      wrapper.style.cursor = 'grab'
      resumeAfterDelay()
    })

    wrapper.addEventListener('mousemove', (e) => {
      if (!isDown) return
      e.preventDefault()
      const x = e.pageX - wrapper.offsetLeft
      const walk = (x - startX) * 1.5
      wrapper.scrollLeft = scrollLeft - walk
    })

    // Touch events
    wrapper.addEventListener('touchstart', (e) => {
      startX = e.touches[0].pageX - wrapper.offsetLeft
      scrollLeft = wrapper.scrollLeft
      pauseAnimation()
    }, { passive: true })

    wrapper.addEventListener('touchend', () => {
      resumeAfterDelay()
    })

    wrapper.addEventListener('touchmove', (e) => {
      const x = e.touches[0].pageX - wrapper.offsetLeft
      const walk = (x - startX) * 1.5
      wrapper.scrollLeft = scrollLeft - walk
    }, { passive: true })

    wrapper.addEventListener('wheel', () => {
      pauseAnimation()
      resumeAfterDelay()
    }, { passive: true })

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
      if (resumeTimeout) clearTimeout(resumeTimeout)
    }
  }, [])

  return (
    <>

    {/* SVG Symbol Definitions */}
    <svg className="svg-defs" xmlns="http://www.w3.org/2000/svg" style={{display: 'none'}}>
        <defs>
            {/* Heelar Star Icon */}
            <symbol id="heelar-star" viewBox="0 0 513 513">
                <path d="M256.772 0.770508C256.772 0.770508 263.988 62.4115 289.402 118.644C301.187 144.72 332.255 180.306 351.142 197.751C402.391 245.087 512.5 253.36 512.5 253.36C512.5 253.36 421.447 276.474 365.953 306.397C334.489 327.436 317.144 355.29 305.763 377.214C278.561 429.61 256.638 512.771 256.638 512.771C256.638 512.771 248.832 431.129 213.414 376.654C196.691 350.934 176.926 323.222 149.893 306.675C84.2754 266.511 0.5 253.245 0.5 253.245C0.5 253.245 100.975 245.116 149.299 208.704C180.861 184.922 194.47 173.233 214.052 138.612C240.712 91.4752 256.772 0.770508 256.772 0.770508Z" fill="#0f4e29"/>
                <path d="M255.47 121.148C255.47 121.148 260.369 153.805 273.504 183.596C279.596 197.411 295.653 216.264 305.415 225.506C331.903 250.585 388.813 254.967 388.813 254.967C388.813 254.967 353.937 260.487 324.438 274.509C313.355 279.777 293.5 299.752 286.391 310.616C264.021 344.804 256.8 392.401 256.8 392.401C256.8 392.401 250.676 350.2 234.23 320.287C225.295 304.036 215.371 291.979 201.399 283.213C167.485 261.935 124.185 254.907 124.185 254.907C124.185 254.907 176.116 250.6 201.092 231.309C217.405 218.709 224.439 212.517 234.56 194.175C248.339 169.203 255.47 121.148 255.47 121.148Z" fill="white"/>
            </symbol>
            {/* Heelar Star Inverted (white outer, green inner) for dark backgrounds */}
            <symbol id="heelar-star-inverted" viewBox="0 0 513 513">
                <path d="M256.772 0.770508C256.772 0.770508 263.988 62.4115 289.402 118.644C301.187 144.72 332.255 180.306 351.142 197.751C402.391 245.087 512.5 253.36 512.5 253.36C512.5 253.36 421.447 276.474 365.953 306.397C334.489 327.436 317.144 355.29 305.763 377.214C278.561 429.61 256.638 512.771 256.638 512.771C256.638 512.771 248.832 431.129 213.414 376.654C196.691 350.934 176.926 323.222 149.893 306.675C84.2754 266.511 0.5 253.245 0.5 253.245C0.5 253.245 100.975 245.116 149.299 208.704C180.861 184.922 194.47 173.233 214.052 138.612C240.712 91.4752 256.772 0.770508 256.772 0.770508Z" fill="white"/>
                <path d="M255.47 121.148C255.47 121.148 260.369 153.805 273.504 183.596C279.596 197.411 295.653 216.264 305.415 225.506C331.903 250.585 388.813 254.967 388.813 254.967C388.813 254.967 353.937 260.487 324.438 274.509C313.355 279.777 293.5 299.752 286.391 310.616C264.021 344.804 256.8 392.401 256.8 392.401C256.8 392.401 250.676 350.2 234.23 320.287C225.295 304.036 215.371 291.979 201.399 283.213C167.485 261.935 124.185 254.907 124.185 254.907C124.185 254.907 176.116 250.6 201.092 231.309C217.405 218.709 224.439 212.517 234.56 194.175C248.339 169.203 255.47 121.148 255.47 121.148Z" fill="#0f4e29"/>
            </symbol>
            {/* Simple Star (for small accents) */}
            <symbol id="star" viewBox="0 0 100 100">
                <path d="M50 0 L54 46 L100 50 L54 54 L50 100 L46 54 L0 50 L46 46 Z"/>
            </symbol>
            {/* Check Icon */}
            <symbol id="icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
            </symbol>
            {/* Shield Icon */}
            <symbol id="icon-shield" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </symbol>
            {/* Video Icon */}
            <symbol id="icon-video" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7"/>
                <rect x="1" y="5" width="15" height="14" rx="2"/>
            </symbol>
            {/* Layers Icon */}
            <symbol id="icon-layers" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                <polyline points="2 17 12 22 22 17"/>
                <polyline points="2 12 12 17 22 12"/>
            </symbol>
            {/* Search Icon */}
            <symbol id="icon-search" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </symbol>
            {/* Book Icon */}
            <symbol id="icon-book" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </symbol>
            {/* Users Icon */}
            <symbol id="icon-users" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </symbol>
            {/* Pen/Journal Icon */}
            <symbol id="icon-pen" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                <path d="M2 2l7.586 7.586"/>
                <circle cx="11" cy="11" r="2"/>
            </symbol>
            {/* Heart Icon */}
            <symbol id="icon-heart" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </symbol>
            {/* Play Icon */}
            <symbol id="icon-play" viewBox="0 0 24 24">
                <polygon points="5 3 19 12 5 21 5 3" fill="currentColor"/>
            </symbol>
            {/* Close Icon */}
            <symbol id="icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
            </symbol>
            {/* Arrow Right Icon */}
            <symbol id="icon-arrow-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
            </symbol>
        </defs>
    </svg>
    
    {/* ==========================================
         ANNOUNCEMENT BANNER
         ========================================== */}
    <div className="announcement-banner">
        <div className="announcement-banner-content">
            <span className="announcement-banner-text"><strong>Now Recruiting Practitioners</strong></span>
            <a href="#healers" className="announcement-banner-link">
                Apply
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                </svg>
            </a>
        </div>
    </div>
    
    {/* ==========================================
         NAVIGATION
         ========================================== */}
    <nav id="nav">
        <div className="container">
            <a href="#" className="logo">
                {/* Heelar logo SVG (star + name) */}
                <svg className="logo-image" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 303 85" fill="none">
                    <path d="M59.8 50.4V81.4C59.8 82.5333 59.3667 83.3333 58.5 83.8C57.6333 84.2 56.7667 84.2 55.9 83.8C55.0333 83.3333 54.6 82.5333 54.6 81.4V52.6H15.2V81.4C15.2 82.5333 14.7667 83.3333 13.9 83.8C13.0333 84.2 12.1667 84.2 11.3 83.8C10.4333 83.3333 10 82.5333 10 81.4V50.4V49.6V18.6C10 17.4667 10.4333 16.7 11.3 16.3C12.1667 15.8333 13.0333 15.8333 13.9 16.3C14.7667 16.7 15.2 17.4667 15.2 18.6V47.4H54.6V18.6C54.6 17.4667 55.0333 16.7 55.9 16.3C56.7667 15.8333 57.6333 15.8333 58.5 16.3C59.3667 16.7 59.8 17.4667 59.8 18.6V49.6C59.8 50.1333 59.8 50.4 59.8 50.4ZM110.524 71.4C111.524 70 112.724 69.8 114.124 70.8C115.524 71.8 115.724 73 114.724 74.4C110.191 80.8667 103.891 84.0667 95.8242 84C89.8242 84 84.6576 81.7333 80.3242 77.2C76.0576 72.6 73.8909 67 73.8242 60.4C73.8242 59.8667 73.8242 59.6 73.8242 59.6C73.8909 55.2667 74.9242 51.3 76.9242 47.7C78.9242 44.0333 81.5909 41.1667 84.9242 39.1C88.2576 37.0333 91.8909 36 95.8242 36C101.958 36 107.158 38.4667 111.424 43.4C115.691 48.3333 117.824 54.7333 117.824 62.6H79.2242C79.7576 67.2 81.5909 71.0667 84.7242 74.2C87.8576 77.2667 91.5576 78.8 95.8242 78.8C101.958 78.8667 106.858 76.4 110.524 71.4ZM79.2242 57.4H112.624C112.624 54.8 111.891 52.2667 110.424 49.8C108.958 47.3333 106.891 45.3 104.224 43.7C101.624 42.0333 98.8242 41.2 95.8242 41.2C91.5576 41.2 87.8576 42.7667 84.7242 45.9C81.5909 48.9667 79.7576 52.8 79.2242 57.4ZM162.477 71.4C163.477 70 164.677 69.8 166.077 70.8C167.477 71.8 167.677 73 166.677 74.4C162.144 80.8667 155.844 84.0667 147.777 84C141.777 84 136.611 81.7333 132.277 77.2C128.011 72.6 125.844 67 125.777 60.4C125.777 59.8667 125.777 59.6 125.777 59.6C125.844 55.2667 126.877 51.3 128.877 47.7C130.877 44.0333 133.544 41.1667 136.877 39.1C140.211 37.0333 143.844 36 147.777 36C153.911 36 159.111 38.4667 163.377 43.4C167.644 48.3333 169.777 54.7333 169.777 62.6H131.177C131.711 67.2 133.544 71.0667 136.677 74.2C139.811 77.2667 143.511 78.8 147.777 78.8C153.911 78.8667 158.811 76.4 162.477 71.4ZM131.177 57.4H164.577C164.577 54.8 163.844 52.2667 162.377 49.8C160.911 47.3333 158.844 45.3 156.177 43.7C153.577 42.0333 150.777 41.2 147.777 41.2C143.511 41.2 139.811 42.7667 136.677 45.9C133.544 48.9667 131.711 52.8 131.177 57.4ZM181.73 16C181.73 14.8667 182.164 14.1 183.03 13.7C183.897 13.2333 184.764 13.2333 185.63 13.7C186.497 14.1 186.93 14.8667 186.93 16V81.4C186.93 82.5333 186.497 83.3333 185.63 83.8C184.764 84.2 183.897 84.2 183.03 83.8C182.164 83.3333 181.73 82.5333 181.73 81.4V16ZM197.066 60C197.066 53.2667 199.2 47.6 203.466 43C207.8 38.3333 213 36 219.066 36C222.333 36 225.433 36.7667 228.366 38.3C231.3 39.7667 233.8 41.8333 235.866 44.5V38.6C235.866 38.0667 236 37.6 236.266 37.2C236.533 36.7333 236.833 36.4333 237.166 36.3C237.566 36.1 238 36 238.466 36C238.933 36 239.333 36.1 239.666 36.3C240.066 36.4333 240.4 36.7333 240.666 37.2C240.933 37.6 241.066 38.0667 241.066 38.6V60V81.4C241.066 82.5333 240.633 83.3333 239.766 83.8C238.9 84.2 238.033 84.2 237.166 83.8C236.3 83.3333 235.866 82.5333 235.866 81.4V75.5C233.8 78.1667 231.3 80.2667 228.366 81.8C225.433 83.2667 222.333 84 219.066 84C213 84 207.8 81.7 203.466 77.1C199.2 72.4333 197.066 66.7333 197.066 60ZM202.266 60C202.266 65.2 203.9 69.6333 207.166 73.3C210.433 76.9667 214.4 78.8 219.066 78.8C222.133 78.8 224.966 77.9667 227.566 76.3C230.166 74.5667 232.2 72.2667 233.666 69.4C235.133 66.5333 235.866 63.4 235.866 60C235.866 54.8 234.233 50.3667 230.966 46.7C227.7 43.0333 223.733 41.2 219.066 41.2C214.4 41.2 210.433 43.0333 207.166 46.7C203.9 50.3667 202.266 54.8 202.266 60ZM262.223 43.3C266.29 38.4333 271.957 36 279.223 36C280.023 36 280.657 36.2667 281.123 36.8C281.59 37.3333 281.823 37.9333 281.823 38.6C281.823 39.2667 281.59 39.8667 281.123 40.4C280.657 40.9333 280.023 41.2 279.223 41.2C275.89 41.2 272.957 41.9 270.423 43.3C267.89 44.7 265.89 46.8 264.423 49.6C262.957 52.4 262.223 55.7 262.223 59.5V60V81.4C262.223 82.5333 261.79 83.3333 260.923 83.8C260.057 84.2 259.19 84.2 258.323 83.8C257.457 83.3333 257.023 82.5333 257.023 81.4V60V59.8C257.023 59.6667 257.023 59.5667 257.023 59.5V38.6C257.023 38.0667 257.157 37.6 257.423 37.2C257.69 36.7333 257.99 36.4333 258.323 36.3C258.723 36.1 259.157 36 259.623 36C260.09 36 260.49 36.1 260.823 36.3C261.223 36.4333 261.557 36.7333 261.823 37.2C262.09 37.6 262.223 38.0667 262.223 38.6V43.3Z" fill="#0f4e29"/>
                    <path d="M292.609 13.2524C292.609 13.2524 293.694 18.4462 296.027 20.5666C298.033 22.3895 302.421 23.2671 302.421 23.2671C302.421 23.2671 297.959 23.9844 295.948 25.8087C293.711 27.8366 292.731 32.838 292.731 32.838C292.731 32.838 292.11 28.7354 290.507 26.8016C288.443 24.3124 283 23.3068 283 23.3068C283 23.3068 286.828 22.8028 288.72 21.4006C289.955 20.4848 290.574 19.795 291.341 18.4618C292.384 16.6466 292.609 13.2524 292.609 13.2524Z" fill="#0f4e29"/>
                    <path d="M292.839 18.0837C292.839 18.0837 293.398 20.7356 294.599 21.8182C295.632 22.7489 297.892 23.197 297.892 23.197C297.892 23.197 295.594 23.5633 294.558 24.4947C293.407 25.5301 292.902 28.0837 292.902 28.0837C292.902 28.0837 292.583 25.9891 291.757 25.0017C290.694 23.7307 287.892 23.2173 287.892 23.2173C287.892 23.2173 289.863 22.96 290.837 22.244C291.473 21.7764 291.792 21.4243 292.186 20.7435C292.724 19.8167 292.839 18.0837 292.839 18.0837Z" fill="white"/>
                </svg>
            </a>
            <div className="nav-right">
                <a href="#healers" className="nav-link">For practitioners</a>
                <button className="btn btn-primary" onClick={() => openModal('client')}>Join Waitlist</button>
            </div>
        </div>
    </nav>

    {/* ==========================================
         HERO SECTION
         ========================================== */}
    <section className="hero">
        <div className="container">
            <div className="hero-card">
                {/* Ambient elements - Heelar Star decorations */}
                <div className="hero-ambient">
                    <svg className="heelar-star-float" viewBox="0 0 513 513"><use href="#heelar-star"/></svg>
                    <svg className="star" viewBox="0 0 100 100"><use href="#star"/></svg>
                </div>
                
                <div className="hero-layout">
                    <div className="hero-text">
                        <div className="hero-text-glow"></div>
                        <div className="hero-badge">
                            <svg className="badge-star" width="18" height="18" viewBox="0 0 513 513"><use href="#heelar-star"/></svg>
                            Welcome to Heelar
                        </div>
                        <h1>
                            For those searching to create change <em>within.</em>
                        </h1>
                        <p className="hero-subtitle">
                            Heelar is embarking on a journey to allow those seeking to make a change in their lives to find practitioners through a unique global platform.
                        </p>
                        <div className="hero-ctas">
                            <button className="btn btn-primary" onClick={() => openModal('client')}>
                                Begin Your Journey
                            </button>
                            <a href="#healers" className="hero-link">
                                I'm a Practitioner 
                                <svg className="hero-link-icon"><use href="#icon-arrow-right"/></svg>
                            </a>
                        </div>
                        <div className="hero-stats">
                            <span className="hero-stat">200+ modalities</span>
                            <span className="hero-stat-dot"></span>
                            <span className="hero-stat">Vetted practitioners</span>
                            <span className="hero-stat-dot"></span>
                            <span className="hero-stat">Global community</span>
                        </div>
                    </div>
                    
                    <div className="hero-visual">
                        {/* High Fidelity iPhone 15 Pro Mockup */}
                        <div className="hero-phone-container">
                            {/* Heelar Star - sits on phone corner */}
                            <svg className="heelar-star-phone" viewBox="0 0 513 513"><use href="#heelar-star"/></svg>
                            <div className="hero-glow"></div>
                            <div className="hero-iphone-frame">
                                <div className="hero-iphone-screen">
                                    {/* Dynamic Island (the pill) */}
                                    <div className="dynamic-island"></div>
                                    
                                    {/* Status Bar */}
                                    <div className="hero-status-bar">
                                        <span className="time">9:41</span>
                                        <div className="icons">
                                        <div className="signal">
                                            <span></span><span></span><span></span><span></span>
                                        </div>
                                        <div className="wifi"></div>
                                        <div className="battery"></div>
                                    </div>
                                </div>
                                
                                {/* App Content */}
                                <div className="hero-app-content">
                                    {/* Header Row */}
                                    <div className="hero-app-header">
                                        <div className="left-icons">
                                            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                                            <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                                        </div>
                                        <h2>Hello Sarah</h2>
                                        <div className="right-icons">
                                            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                                            <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                                        </div>
                                    </div>
                                    
                                    {/* Four Pillars: Heart, Body, Mind, Soul */}
                                    <div className="hero-pillars">
                                        <div className="hero-pillar">
                                            <div className="hero-pillar-icon">
                                                <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                                            </div>
                                            <span>Heart</span>
                                        </div>
                                        <div className="hero-pillar">
                                            <div className="hero-pillar-icon">
                                                <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                            </div>
                                            <span>Body</span>
                                        </div>
                                        <div className="hero-pillar">
                                            <div className="hero-pillar-icon">
                                                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                                            </div>
                                            <span>Mind</span>
                                        </div>
                                        <div className="hero-pillar">
                                            <div className="hero-pillar-icon">
                                                <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                                            </div>
                                            <span>Soul</span>
                                        </div>
                                    </div>
                                    
                                    {/* My Sessions */}
                                    <div className="hero-sessions">
                                        <div className="hero-section-header">
                                            <h3>My Sessions</h3>
                                            <a href="#">See All</a>
                                        </div>
                                        <div className="hero-session-card">
                                            <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=100&h=100&fit=crop" alt="Crystal Healing" className="hero-session-img" />
                                            <div className="hero-session-details">
                                                <h4>Crystal Healing</h4>
                                                <div className="hero-session-meta">
                                                    <span>⏱ 45m</span>
                                                    <span>👤 1:1</span>
                                                </div>
                                                <div className="hero-session-practitioner">
                                                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face" alt="Jay" className="mini-avatar" />
                                                    <span>Jay S.</span>
                                                </div>
                                            </div>
                                            <div className="hero-session-right">
                                                <div className="date">Today</div>
                                                <div className="time">14:30</div>
                                                <button className="join-btn">Join</button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Trending */}
                                    <div className="hero-trending">
                                        <div className="hero-section-header">
                                            <h3>Trending</h3>
                                            <a href="#">See All</a>
                                        </div>
                                        <div className="hero-trending-card">
                                            <img src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=200&fit=crop" alt="Meditation" className="trending-bg" />
                                            <div className="trending-overlay"></div>
                                            <div className="trending-content">
                                                <span className="tag">Popular</span>
                                                <h4>Soul Discovery</h4>
                                                <p>Chakra Balancing · 6 sessions</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Bottom Navigation */}
                                <div className="hero-bottom-nav">
                                    <div className="hero-nav-item active">
                                        <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                                        <span>Home</span>
                                    </div>
                                    <div className="hero-nav-item">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                                        <span>Explore</span>
                                    </div>
                                    <div className="hero-nav-item">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                        <span>Sessions</span>
                                    </div>
                                    <div className="hero-nav-item">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                        <span>Profile</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </div>
    </section>

    {/* ==========================================
         TRUST STRIP
         ========================================== */}
    <section className="trust-strip">
        <div className="container">
            <div className="trust-card reveal">
                <div className="trust-content">
                    <div className="trust-item">
                        <span className="trust-value">200+</span>
                        <span className="trust-label">Healing Modalities</span>
                    </div>
                    <div className="trust-divider"></div>
                    <div className="trust-item">
                        <span className="trust-value">100%</span>
                        <span className="trust-label">Vetted Practitioners</span>
                    </div>
                    <div className="trust-divider"></div>
                    <div className="trust-item">
                        <span className="trust-value">1:1</span>
                        <span className="trust-label">Private Sessions</span>
                    </div>
                    <div className="trust-divider"></div>
                    <div className="trust-item">
                        <span className="trust-value">24/7</span>
                        <span className="trust-label">Global Access</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    {/* ==========================================
         ABOUT HEELAR - Stripe Style (Left scrolls, Right sticky)
         ========================================== */}
    <section className="about-stripe" id="about">
        {/* LEFT SIDE - Scrolling text sections */}
        <div className="about-stripe-left">
            {/* Section 1: About */}
            <div className="about-stripe-text" data-index="0">
                <div className="about-stripe-text-inner">
                    <span className="about-stripe-label">
                        <svg width="18" height="18" viewBox="0 0 513 513"><use href="#heelar-star"/></svg>
                        About Heelar
                    </span>
                    <h2 className="about-stripe-title">Creating change within</h2>
                    <p className="about-stripe-desc">A healing platform connecting you with vetted practitioners across 200+ modalities. Find your path to wellness through authentic human connection.</p>
                    <a href="#waitlist" className="about-stripe-cta">
                        Get early access
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </a>
                </div>
                {/* Mobile Phone Mockup - Exact copy of desktop */}
                <div className="mobile-phone-mockup">
                    <div className="mobile-phone-wrapper">
                        <div className="stripe-iphone-frame">
                            <div className="stripe-iphone-screen dark-screen">
                                <div className="stripe-dynamic-island"></div>
                                <div className="stripe-status-bar light">
                                    <span className="time">9:41</span>
                                    <div className="status-right">
                                        <div className="signal-bars light"><span></span><span></span><span></span><span></span></div>
                                        <div className="wifi-icon light"></div>
                                        <div className="battery-icon-sm light"></div>
                                    </div>
                                </div>
                                
                                {/* Practitioner Header Row */}
                                <div className="prac-header-row">
                                    <svg className="back-arrow" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                                    <div className="prac-header-center">
                                        <strong>Clarisse Meyer</strong>
                                        <span>New York, USA</span>
                                        <span className="prac-mods">EFT • Soul Healing • Light Language</span>
                                    </div>
                                    <div style={{width: '20px'}}></div>
                                </div>
                                
                                {/* Large Cover Photo with overlays */}
                                <div className="prac-cover-area">
                                    <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=320&fit=crop" alt="" />
                                    
                                    {/* Avatar bottom left */}
                                    <div className="prac-avatar">
                                        <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop&crop=face" alt="" />
                                    </div>
                                    
                                    {/* Stats overlay */}
                                    <div className="prac-stats-overlay">
                                        <div><strong>21k</strong><span>Following</span></div>
                                        <div><strong>1,208</strong><span>Followers</span></div>
                                        <div><strong>380</strong><span>Posts</span></div>
                                    </div>
                                    
                                    {/* Carousel dots */}
                                    <div className="prac-carousel-dots">
                                        <span className="active"></span><span></span><span></span><span></span>
                                    </div>
                                </div>
                                
                                {/* White bottom section */}
                                <div className="prac-bottom-section">
                                    {/* Actions Row */}
                                    <div className="prac-action-row">
                                        <div className="prac-like">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg>
                                            <span>1.2k</span>
                                        </div>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
                                        <button className="follow-btn">Follow</button>
                                    </div>
                                    
                                    {/* Tabs */}
                                    <div className="prac-tab-row">
                                        <span className="active">Healing</span>
                                        <span>Courses</span>
                                        <span>Workshops</span>
                                    </div>
                                    
                                    {/* Content Preview */}
                                    <div className="prac-content-preview">
                                        <div className="prac-session-mini">
                                            <img src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=60&h=60&fit=crop" alt="" />
                                            <div className="session-mini-info">
                                                <strong>Crystal Healing</strong>
                                                <span>⏱ 45m · 👤 1:1</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Section 2: Vision */}
            <div className="about-stripe-text" data-index="1">
                <div className="about-stripe-text-inner">
                    <span className="about-stripe-label">
                        <svg width="18" height="18" viewBox="0 0 513 513"><use href="#heelar-star"/></svg>
                        Our vision
                    </span>
                    <h2 className="about-stripe-title">Embracing healing as a way of life</h2>
                    <p className="about-stripe-desc">We envision a world where authenticity is celebrated, vulnerability is embraced, and individuals are empowered to speak their truth without fear.</p>
                    <a href="#waitlist" className="about-stripe-cta">
                        Join the movement
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </a>
                </div>
                {/* Mobile Phone Mockup - Exact copy of desktop */}
                <div className="mobile-phone-mockup">
                    <div className="mobile-phone-wrapper">
                        <div className="stripe-iphone-frame">
                            <div className="stripe-iphone-screen">
                                <div className="stripe-dynamic-island"></div>
                                <div className="stripe-status-bar">
                                    <span className="time">9:41</span>
                                    <div className="status-right">
                                        <div className="signal-bars"><span></span><span></span><span></span><span></span></div>
                                        <div className="wifi-icon"></div>
                                        <div className="battery-icon-sm"></div>
                                    </div>
                                </div>
                                
                                {/* Schedule Header */}
                                <div className="schedule-nav">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                                    <strong>Schedule</strong>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                                </div>
                                
                                {/* Month */}
                                <div className="month-row">
                                    <div className="month-arrows">
                                        <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
                                    </div>
                                    <span>March 2026</span>
                                    <div className="month-arrows">
                                        <svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
                                    </div>
                                </div>
                                
                                {/* Days */}
                                <div className="days-row">
                                    <div className="day-pill active"><span>THU</span><strong>26</strong></div>
                                    <div className="day-pill"><span>FRI</span><strong>27</strong></div>
                                    <div className="day-pill"><span>SAT</span><strong>28</strong></div>
                                    <div className="day-pill"><span>SUN</span><strong>29</strong></div>
                                </div>
                                
                                {/* Session Card */}
                                <div className="session-card-dark">
                                    <img src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=300&h=180&fit=crop" alt="" />
                                    <div className="session-card-content">
                                        <span className="level">Intermediate</span>
                                        <strong className="title">Soul Discovery</strong>
                                        <span className="subtitle">Chakra Balancing</span>
                                        <div className="meta-row">
                                            <span>🌐 English</span>
                                            <span>⏱ 45m</span>
                                        </div>
                                        <div className="host-row">
                                            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face" alt="" />
                                            <div><strong>Jay Sangi</strong></div>
                                            <span className="price">£65</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Time Slots */}
                                <div className="time-grid">
                                    <span className="slot">9:30</span>
                                    <span className="slot active">14:30</span>
                                    <span className="slot">15:30</span>
                                </div>
                                
                                <button className="book-btn">Book Session</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Section 3: Four Pillars */}
            <div className="about-stripe-text" data-index="2">
                <div className="about-stripe-text-inner">
                    <span className="about-stripe-label">
                        <svg width="18" height="18" viewBox="0 0 513 513"><use href="#heelar-star"/></svg>
                        The four pillars
                    </span>
                    <h2 className="about-stripe-title">Heart, Body, Mind & Soul</h2>
                    <p className="about-stripe-desc">Our approach to wellness addresses every dimension of your being. True healing happens when all four pillars are nurtured together.</p>
                    <a href="#pillars" className="about-stripe-cta">
                        Explore the pillars
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </a>
                </div>
                {/* Mobile Phone Mockup - All Healing Screen */}
                <div className="mobile-phone-mockup">
                    <div className="mobile-phone-wrapper">
                        <div className="stripe-iphone-frame">
                            <div className="stripe-iphone-screen mint-screen">
                                <div className="stripe-dynamic-island"></div>
                                <div className="stripe-status-bar">
                                    <span className="time">19:27</span>
                                    <div className="status-right">
                                        <div className="signal-bars"><span></span><span></span><span></span><span></span></div>
                                        <div className="wifi-icon"></div>
                                        <div className="battery-icon-sm"></div>
                                    </div>
                                </div>
                                
                                {/* All Healing Header */}
                                <div className="healing-header">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                                    <strong>All Healing</strong>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                                </div>
                                
                                {/* Tabs */}
                                <div className="healing-tabs">
                                    <span className="healing-tab active">Healing</span>
                                    <span className="healing-tab">Courses</span>
                                    <span className="healing-tab">Workshops</span>
                                </div>
                                
                                {/* Filters - single line */}
                                <div className="healing-filters">
                                    <span className="healing-pill active">All</span>
                                    <span className="healing-pill">EFT</span>
                                    <span className="healing-pill">Crystal</span>
                                    <span className="healing-pill">Reiki</span>
                                    <span className="healing-pill">UK</span>
                                    <span className="healing-pill">USA</span>
                                </div>
                                
                                {/* Healer Card 1 */}
                                <div className="healer-card">
                                    <img className="healer-card-avatar" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face" alt="Amit Kumar" />
                                    <div className="healer-card-info">
                                        <div className="healer-card-name">Amit Kumar</div>
                                        <div className="healer-card-location">Location</div>
                                        <div className="healer-card-modalities"><strong>Crystal</strong> <span className="dot">•</span> Reiki <span className="dot">•</span> Energy</div>
                                        <div className="healer-card-sessions">02 Sessions completed</div>
                                    </div>
                                    <span className="healer-card-followers">165 Followers</span>
                                </div>
                                
                                {/* Healer Card 2 */}
                                <div className="healer-card">
                                    <img className="healer-card-avatar" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face" alt="Pankaj" />
                                    <div className="healer-card-info">
                                        <div className="healer-card-name">Pankaj</div>
                                        <div className="healer-card-location">Location</div>
                                        <div className="healer-card-modalities"><strong>EFT</strong> <span className="dot">•</span> Soul Healing <span className="dot">•</span> Breathwork</div>
                                        <div className="healer-card-sessions">02 Sessions completed</div>
                                    </div>
                                    <span className="healer-card-followers">165 Followers</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Section 4: Experience */}
            <div className="about-stripe-text" data-index="3">
                <div className="about-stripe-text-inner">
                    <span className="about-stripe-label">
                        <svg width="18" height="18" viewBox="0 0 513 513"><use href="#heelar-star"/></svg>
                        The experience
                    </span>
                    <h2 className="about-stripe-title">Your healing journey, simplified</h2>
                    <p className="about-stripe-desc">Discover practitioners, book sessions, join circles, and reflect through journaling—all in one place designed to support your growth.</p>
                    <a href="#waitlist" className="about-stripe-cta">
                        See how it works
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </a>
                </div>
                {/* Mobile Phone Mockup - Session Details */}
                <div className="mobile-phone-mockup">
                    <div className="mobile-phone-wrapper">
                        <div className="stripe-iphone-frame">
                            <div className="stripe-iphone-screen" style={{background: '#fff', display: 'flex', flexDirection: 'column'}}>
                                <div className="stripe-dynamic-island"></div>
                                
                                {/* Session Hero with image background */}
                                <div className="session-hero">
                                    <img src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=400&fit=crop" alt="Crystal Healing Session" />
                                    <div className="session-hero-overlay">
                                        {/* Status bar inside overlay */}
                                        <div className="stripe-status-bar" style={{position: 'absolute', top: '0', left: '0', right: '0', padding: '8px 14px'}}>
                                            <span className="time" style={{color: 'white'}}>19:27</span>
                                            <div className="status-right">
                                                <div className="signal-bars light"><span></span><span></span><span></span><span></span></div>
                                                <div className="wifi-icon light"></div>
                                                <div className="battery-icon-sm light"></div>
                                            </div>
                                        </div>
                                        
                                        {/* Title section at top */}
                                        <div className="session-hero-top">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                                            <div className="session-hero-title">
                                                <span className="label">Healing Session</span>
                                                <h3>Crystal Healing</h3>
                                            </div>
                                            <div style={{width: '18px'}}></div>
                                        </div>
                                        
                                        {/* Bottom info section */}
                                        <div className="session-hero-bottom">
                                            <div>
                                                <div className="session-hero-info">
                                                    <span>🌐 English</span>
                                                    <span>⏱ 45m</span>
                                                    <span>👤 1:1</span>
                                                </div>
                                                <div className="session-practitioner">
                                                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face" alt="Jay Sangi" />
                                                    <div className="session-practitioner-info">
                                                        <strong>Jay Sangi</strong>
                                                        <span>Location</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="session-price-badge">
                                                £65
                                                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                            </div>
                                        </div>
                                        
                                        {/* Dots at bottom of hero */}
                                        <div className="session-dots">
                                            <span className="active"></span>
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Actions Bar - separate from hero */}
                                <div className="session-actions">
                                    <div className="like">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                                        1.2k
                                    </div>
                                    <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
                                    <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                                    <span className="follow-btn">Follow</span>
                                </div>
                                
                                {/* Content */}
                                <div className="session-content">
                                    <div className="session-section">
                                        <h4>Overview</h4>
                                        <p>Crystal healing entails crystals being placed on your chakras. They are intuitively chosen and will combine with your energies to release anything that is being held that doesnt serve you.</p>
                                    </div>
                                    
                                    <div className="session-section">
                                        <h4>Benefits</h4>
                                        <p>Allow you to feel calmer and lighter and a sense of tranquility.</p>
                                    </div>
                                    
                                    <div className="session-section">
                                        <h4>Your Environment</h4>
                                        <p>A quiet space, calm space where you can lie down and fully relax.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        {/* RIGHT SIDE - Sticky mockup area */}
        <div className="about-stripe-right">
            <div className="stripe-guides">
                <div className="guide-vertical"></div>
                <div className="guide-horizontal"></div>
            </div>
            
            <div className="about-stripe-canvas">
                {/* Scene 1: Practitioner Profile */}
                <div className="stripe-scene active" data-index="0">
                    <div className="floating-icon icon-tl anim-1" style={{animationDelay: '0.1s'}}>
                        <svg viewBox="0 0 24 24" fill="var(--green-deep)"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                    
                    <div className="stripe-phone" style={{animationDelay: '0s'}}>
                        <div className="stripe-iphone-frame">
                            <div className="stripe-iphone-screen dark-screen">
                                <div className="stripe-dynamic-island"></div>
                                <div className="stripe-status-bar light">
                                    <span className="time">19:27</span>
                                    <div className="status-right">
                                        <div className="signal-bars light"><span></span><span></span><span></span><span></span></div>
                                        <div className="wifi-icon light"></div>
                                        <div className="battery-icon-sm light"></div>
                                    </div>
                                </div>
                                
                                {/* Practitioner Header Row */}
                                <div className="prac-header-row">
                                    <svg className="back-arrow" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                                    <div className="prac-header-center">
                                        <strong>Clarisse Meyer</strong>
                                        <span>New York, USA</span>
                                        <span className="prac-mods">EFT • Soul Healing • Light Language</span>
                                    </div>
                                    <div style={{width: '20px'}}></div>
                                </div>
                                
                                {/* Large Cover Photo with overlays */}
                                <div className="prac-cover-area">
                                    <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=320&fit=crop" alt="" />
                                    
                                    {/* Avatar bottom left */}
                                    <div className="prac-avatar">
                                        <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop&crop=face" alt="" />
                                    </div>
                                    
                                    {/* Stats overlay */}
                                    <div className="prac-stats-overlay">
                                        <div><strong>21k</strong><span>Following</span></div>
                                        <div><strong>1,208</strong><span>Followers</span></div>
                                        <div><strong>380</strong><span>Posts</span></div>
                                    </div>
                                    
                                    {/* Carousel dots */}
                                    <div className="prac-carousel-dots">
                                        <span className="active"></span><span></span><span></span><span></span>
                                    </div>
                                </div>
                                
                                {/* White bottom section */}
                                <div className="prac-bottom-section">
                                    {/* Actions Row */}
                                    <div className="prac-action-row">
                                        <div className="prac-like">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg>
                                            <span>1.2k</span>
                                        </div>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
                                        <button className="follow-btn">Follow</button>
                                    </div>
                                    
                                    {/* Tabs */}
                                    <div className="prac-tab-row">
                                        <span className="active">Healing</span>
                                        <span>Courses</span>
                                        <span>Workshops</span>
                                        <span>Free</span>
                                    </div>
                                    
                                    {/* Content Preview */}
                                    <div className="prac-content-preview">
                                        <div className="prac-session-mini">
                                            <img src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=60&h=60&fit=crop" alt="" />
                                            <div className="session-mini-info">
                                                <strong>Crystal Healing</strong>
                                                <span>⏱ 45m · 👤 1:1</span>
                                            </div>
                                            <span className="session-mini-time">14:30</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="floating-card review-float anim-2" style={{animationDelay: '0.2s'}}>
                        <div className="stars">★★★★★</div>
                        <p>"Life-changing sessions"</p>
                    </div>
                </div>
                
                {/* Scene 2: Schedule/Booking */}
                <div className="stripe-scene" data-index="1">
                    <div className="floating-icon icon-tl anim-2" style={{animationDelay: '0.1s'}}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="var(--green-deep)" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    </div>
                    
                    <div className="stripe-phone" style={{animationDelay: '0s'}}>
                        <div className="stripe-iphone-frame">
                            <div className="stripe-iphone-screen">
                                <div className="stripe-dynamic-island"></div>
                                <div className="stripe-status-bar">
                                    <span className="time">19:27</span>
                                    <div className="status-right">
                                        <div className="signal-bars"><span></span><span></span><span></span><span></span></div>
                                        <div className="wifi-icon"></div>
                                        <div className="battery-icon-sm"></div>
                                    </div>
                                </div>
                                
                                {/* Schedule Header */}
                                <div className="schedule-nav">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                                    <strong>Schedule</strong>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                                </div>
                                
                                {/* Month */}
                                <div className="month-row">
                                    <div className="month-arrows">
                                        <svg viewBox="0 0 24 24"><path d="M11 17l-5-5 5-5M18 17l-5-5 5-5"/></svg>
                                        <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
                                    </div>
                                    <span>March 2023</span>
                                    <div className="month-arrows">
                                        <svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
                                        <svg viewBox="0 0 24 24"><path d="M13 17l5-5-5-5M6 17l5-5-5-5"/></svg>
                                    </div>
                                </div>
                                
                                {/* Days */}
                                <div className="days-row">
                                    <div className="day-pill active"><span>THU</span><strong>26</strong></div>
                                    <div className="day-pill"><span>FRI</span><strong>27</strong></div>
                                    <div className="day-pill"><span>SAT</span><strong>28</strong></div>
                                    <div className="day-pill"><span>SUN</span><strong>29</strong></div>
                                    <div className="day-pill"><span>MON</span><strong>30</strong></div>
                                </div>
                                
                                {/* Session Card */}
                                <div className="session-card-dark">
                                    <img src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=300&h=180&fit=crop" alt="" />
                                    <div className="session-card-content">
                                        <span className="level">Intermediate</span>
                                        <strong className="title">Soul Discovery</strong>
                                        <span className="subtitle">Chakra Balancing</span>
                                        <div className="meta-row">
                                            <span>🌐 English</span>
                                            <span>⏱ 45m</span>
                                            <span>👤 1:1</span>
                                        </div>
                                        <div className="host-row">
                                            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face" alt="" />
                                            <div><strong>Jay Sangi</strong><span>Location</span></div>
                                            <span className="price">£65</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Time Slots */}
                                <div className="time-grid">
                                    <span className="slot">9:30</span>
                                    <span className="slot">10:30</span>
                                    <span className="slot active">14:30</span>
                                    <span className="slot">15:30</span>
                                </div>
                                
                                <button className="book-btn">Book Session</button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="floating-card time-float anim-3" style={{animationDelay: '0.2s'}}>
                        <strong>14:30</strong>
                        <span>Selected</span>
                    </div>
                </div>
                
                {/* Scene 3: All Healing */}
                <div className="stripe-scene" data-index="2">
                    <div className="floating-icon icon-tl anim-3" style={{animationDelay: '0.1s'}}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="var(--green-deep)" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
                    </div>
                    
                    <div className="stripe-phone" style={{animationDelay: '0s'}}>
                        <div className="stripe-iphone-frame">
                            <div className="stripe-iphone-screen mint-screen">
                                <div className="stripe-dynamic-island"></div>
                                <div className="stripe-status-bar">
                                    <span className="time">19:27</span>
                                    <div className="status-right">
                                        <div className="signal-bars"><span></span><span></span><span></span><span></span></div>
                                        <div className="wifi-icon"></div>
                                        <div className="battery-icon-sm"></div>
                                    </div>
                                </div>
                                
                                {/* All Healing Header */}
                                <div className="healing-header">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                                    <strong>All Healing</strong>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                                </div>
                                
                                {/* Tabs */}
                                <div className="healing-tabs">
                                    <span className="healing-tab active">Healing</span>
                                    <span className="healing-tab">Courses</span>
                                    <span className="healing-tab">Workshops</span>
                                </div>
                                
                                {/* Filters - single line */}
                                <div className="healing-filters">
                                    <span className="healing-pill active">All</span>
                                    <span className="healing-pill">EFT</span>
                                    <span className="healing-pill">Crystal</span>
                                    <span className="healing-pill">Reiki</span>
                                    <span className="healing-pill">UK</span>
                                    <span className="healing-pill">USA</span>
                                </div>
                                
                                {/* Healer Card 1 */}
                                <div className="healer-card">
                                    <img className="healer-card-avatar" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face" alt="Amit Kumar" />
                                    <div className="healer-card-info">
                                        <div className="healer-card-name">Amit Kumar</div>
                                        <div className="healer-card-location">Location</div>
                                        <div className="healer-card-modalities"><strong>Crystal</strong> <span className="dot">•</span> Reiki <span className="dot">•</span> Energy</div>
                                        <div className="healer-card-sessions">02 Sessions completed</div>
                                    </div>
                                    <span className="healer-card-followers">165 Followers</span>
                                </div>
                                
                                {/* Healer Card 2 */}
                                <div className="healer-card">
                                    <img className="healer-card-avatar" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face" alt="Pankaj" />
                                    <div className="healer-card-info">
                                        <div className="healer-card-name">Pankaj</div>
                                        <div className="healer-card-location">Location</div>
                                        <div className="healer-card-modalities"><strong>EFT</strong> <span className="dot">•</span> Soul Healing <span className="dot">•</span> Breathwork</div>
                                        <div className="healer-card-sessions">02 Sessions completed</div>
                                    </div>
                                    <span className="healer-card-followers">165 Followers</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="floating-card mod-float anim-1" style={{animationDelay: '0.2s'}}>
                        <strong>200+</strong>
                        <span>Modalities</span>
                    </div>
                </div>
                
                {/* Scene 4: Session Details */}
                <div className="stripe-scene" data-index="3">
                    <div className="floating-icon icon-tl anim-4" style={{animationDelay: '0.1s'}}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="var(--green-deep)" strokeWidth="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    </div>
                    
                    <div className="stripe-phone" style={{animationDelay: '0s'}}>
                        <div className="stripe-iphone-frame">
                            <div className="stripe-iphone-screen" style={{background: '#fff', display: 'flex', flexDirection: 'column'}}>
                                <div className="stripe-dynamic-island"></div>
                                
                                {/* Session Hero with image background */}
                                <div className="session-hero">
                                    <img src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=400&fit=crop" alt="Crystal Healing Session" />
                                    <div className="session-hero-overlay">
                                        {/* Status bar inside overlay */}
                                        <div className="stripe-status-bar" style={{position: 'absolute', top: '0', left: '0', right: '0', padding: '8px 14px'}}>
                                            <span className="time" style={{color: 'white'}}>19:27</span>
                                            <div className="status-right">
                                                <div className="signal-bars light"><span></span><span></span><span></span><span></span></div>
                                                <div className="wifi-icon light"></div>
                                                <div className="battery-icon-sm light"></div>
                                            </div>
                                        </div>
                                        
                                        {/* Title section at top */}
                                        <div className="session-hero-top">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                                            <div className="session-hero-title">
                                                <span className="label">Healing Session</span>
                                                <h3>Crystal Healing</h3>
                                            </div>
                                            <div style={{width: '18px'}}></div>
                                        </div>
                                        
                                        {/* Bottom info section */}
                                        <div className="session-hero-bottom">
                                            <div>
                                                <div className="session-hero-info">
                                                    <span>🌐 English</span>
                                                    <span>⏱ 45m</span>
                                                    <span>👤 1:1</span>
                                                </div>
                                                <div className="session-practitioner">
                                                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face" alt="Jay Sangi" />
                                                    <div className="session-practitioner-info">
                                                        <strong>Jay Sangi</strong>
                                                        <span>Location</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="session-price-badge">
                                                £65
                                                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                            </div>
                                        </div>
                                        
                                        {/* Dots at bottom of hero */}
                                        <div className="session-dots">
                                            <span className="active"></span>
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Actions Bar - separate from hero */}
                                <div className="session-actions">
                                    <div className="like">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                                        1.2k
                                    </div>
                                    <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
                                    <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                                    <span className="follow-btn">Follow</span>
                                </div>
                                
                                {/* Content */}
                                <div className="session-content">
                                    <div className="session-section">
                                        <h4>Overview</h4>
                                        <p>Crystal healing entails crystals being placed on your chakras. They are intuitively chosen and will combine with your energies to release anything that is being held that doesnt serve you.</p>
                                    </div>
                                    
                                    <div className="session-section">
                                        <h4>Benefits</h4>
                                        <p>Allow you to feel calmer and lighter and a sense of tranquility.</p>
                                    </div>
                                    
                                    <div className="session-section">
                                        <h4>Your Environment</h4>
                                        <p>A quiet space, calm space where you can lie down and fully relax.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="floating-card share-float anim-2" style={{animationDelay: '0.2s'}}>
                        <strong>Book Now</strong>
                        <span>Sessions from £30</span>
                    </div>
                </div>
            </div>
            
            {/* Navigation dots */}
            <div className="about-stripe-dots">
                <button className="stripe-dot active" data-index="0"></button>
                <button className="stripe-dot" data-index="1"></button>
                <button className="stripe-dot" data-index="2"></button>
                <button className="stripe-dot" data-index="3"></button>
            </div>
        </div>
    </section>

    {/* ==========================================
         EXPLORE SECTION - Horizontal Scroll Showcase
         ========================================== */}
    <section className="explore-section" id="explore">
        <div className="explore-container">
            {/* Header */}
            <div className="explore-header reveal">
                <div className="explore-label">
                    <svg width="18" height="18" viewBox="0 0 513 513"><use href="#heelar-star"/></svg>
                    Explore
                </div>
                <h2>Many ways to heal</h2>
                <p>From private sessions to group circles, workshops to courses — find the format that fits your journey</p>
            </div>
        </div>
        
        {/* Infinite Scroll Track */}
        <div className="explore-scroll-wrapper">
            <div className="explore-scroll-track">
                {/* ===== FIRST SET OF CARDS ===== */}
                {/* Session Card 1 */}
                <div className="explore-card session">
                    <div className="explore-card-image">
                        <img src="https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&h=500&fit=crop" alt="Yoga session" />
                        <div className="explore-card-badge">
                            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>
                            Today • 7:00PM
                        </div>
                    </div>
                    <div className="explore-card-content">
                        <div className="explore-card-meta">
                            <span className="explore-card-author">Morgan Jaymes</span>
                            <span className="explore-card-action">Join Now</span>
                        </div>
                        <h3 className="explore-card-title">Two Hours Of Tranquility</h3>
                        <span className="explore-card-category">1:1 Session</span>
                        <p className="explore-card-desc">Gentle yoga flow to quiet the mind and reconnect with your body.</p>
                    </div>
                </div>
                
                {/* Workshop Card */}
                <div className="explore-card workshop">
                    <div className="explore-card-image">
                        <img src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=450&fit=crop" alt="Meditation workshop" />
                        <div className="explore-card-badge">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
                            Workshop • Aug 16
                        </div>
                    </div>
                    <div className="explore-card-content">
                        <div className="explore-card-meta">
                            <span className="explore-card-author">Jay Sangi</span>
                            <span className="explore-card-action">£65</span>
                        </div>
                        <h3 className="explore-card-title">Soul Discovery: A Day of Inner Exploration</h3>
                        <span className="explore-card-category">Workshop</span>
                        <p className="explore-card-desc">Uncover your authentic self through guided meditation and journaling.</p>
                    </div>
                </div>
                
                {/* Circle Card */}
                <div className="explore-card circle">
                    <div className="explore-card-image">
                        <img src="https://images.unsplash.com/photo-1529693662653-9d480530a697?w=400&h=400&fit=crop" alt="Women's circle" />
                        <div className="explore-card-badge">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                            8 members
                        </div>
                    </div>
                    <div className="explore-card-content">
                        <div className="explore-card-meta">
                            <span className="explore-card-author">Weekly • Thursdays</span>
                        </div>
                        <h3 className="explore-card-title">Women's Sharing Circle</h3>
                        <span className="explore-card-category">Circle</span>
                        <p className="explore-card-desc">A safe space to share, listen, and connect with like-minded women.</p>
                    </div>
                </div>
                
                {/* Session Card 2 */}
                <div className="explore-card session">
                    <div className="explore-card-image">
                        <img src="https://images.unsplash.com/photo-1591228127791-8e2eaef098d3?w=400&h=500&fit=crop" alt="Sound healing" />
                        <div className="explore-card-badge">
                            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>
                            Tomorrow • 10AM
                        </div>
                    </div>
                    <div className="explore-card-content">
                        <div className="explore-card-meta">
                            <span className="explore-card-author">Chris Collins</span>
                            <span className="explore-card-action">Book</span>
                        </div>
                        <h3 className="explore-card-title">Rain & Thunder Sound</h3>
                        <span className="explore-card-category">1:1 Session</span>
                        <p className="explore-card-desc">Immersive soundscape journey to release tension and restore calm.</p>
                    </div>
                </div>
                
                {/* Course Card */}
                <div className="explore-card course">
                    <div className="explore-card-image">
                        <img src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&h=300&fit=crop" alt="Course content" />
                    </div>
                    <div className="explore-card-content">
                        <div className="explore-card-meta">
                            <span className="explore-card-author">Auriel Hagan</span>
                            <span className="explore-card-action">8 weeks</span>
                        </div>
                        <h3 className="explore-card-title">Foundations of Breathwork</h3>
                        <span className="explore-card-category">Course</span>
                        <p className="explore-card-desc">Master ancient and modern breathing techniques for healing.</p>
                    </div>
                </div>
                
                {/* Another Circle */}
                <div className="explore-card circle">
                    <div className="explore-card-image">
                        <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop" alt="Men's circle" />
                        <div className="explore-card-badge">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                            12 members
                        </div>
                    </div>
                    <div className="explore-card-content">
                        <div className="explore-card-meta">
                            <span className="explore-card-author">Bi-weekly • Sundays</span>
                        </div>
                        <h3 className="explore-card-title">Men's Breathwork Circle</h3>
                        <span className="explore-card-category">Circle</span>
                        <p className="explore-card-desc">Brotherhood and breathwork in a supportive men's community.</p>
                    </div>
                </div>
                
                {/* ===== DUPLICATE SET FOR SEAMLESS LOOP ===== */}
                {/* Session Card 1 */}
                <div className="explore-card session">
                    <div className="explore-card-image">
                        <img src="https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&h=500&fit=crop" alt="Yoga session" />
                        <div className="explore-card-badge">
                            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>
                            Today • 7:00PM
                        </div>
                    </div>
                    <div className="explore-card-content">
                        <div className="explore-card-meta">
                            <span className="explore-card-author">Morgan Jaymes</span>
                            <span className="explore-card-action">Join Now</span>
                        </div>
                        <h3 className="explore-card-title">Two Hours Of Tranquility</h3>
                        <span className="explore-card-category">1:1 Session</span>
                        <p className="explore-card-desc">Gentle yoga flow to quiet the mind and reconnect with your body.</p>
                    </div>
                </div>
                
                {/* Workshop Card */}
                <div className="explore-card workshop">
                    <div className="explore-card-image">
                        <img src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=450&fit=crop" alt="Meditation workshop" />
                        <div className="explore-card-badge">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
                            Workshop • Aug 16
                        </div>
                    </div>
                    <div className="explore-card-content">
                        <div className="explore-card-meta">
                            <span className="explore-card-author">Jay Sangi</span>
                            <span className="explore-card-action">£65</span>
                        </div>
                        <h3 className="explore-card-title">Soul Discovery: A Day of Inner Exploration</h3>
                        <span className="explore-card-category">Workshop</span>
                        <p className="explore-card-desc">Uncover your authentic self through guided meditation and journaling.</p>
                    </div>
                </div>
                
                {/* Circle Card */}
                <div className="explore-card circle">
                    <div className="explore-card-image">
                        <img src="https://images.unsplash.com/photo-1529693662653-9d480530a697?w=400&h=400&fit=crop" alt="Women's circle" />
                        <div className="explore-card-badge">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                            8 members
                        </div>
                    </div>
                    <div className="explore-card-content">
                        <div className="explore-card-meta">
                            <span className="explore-card-author">Weekly • Thursdays</span>
                        </div>
                        <h3 className="explore-card-title">Women's Sharing Circle</h3>
                        <span className="explore-card-category">Circle</span>
                        <p className="explore-card-desc">A safe space to share, listen, and connect with like-minded women.</p>
                    </div>
                </div>
                
                {/* Session Card 2 */}
                <div className="explore-card session">
                    <div className="explore-card-image">
                        <img src="https://images.unsplash.com/photo-1591228127791-8e2eaef098d3?w=400&h=500&fit=crop" alt="Sound healing" />
                        <div className="explore-card-badge">
                            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>
                            Tomorrow • 10AM
                        </div>
                    </div>
                    <div className="explore-card-content">
                        <div className="explore-card-meta">
                            <span className="explore-card-author">Chris Collins</span>
                            <span className="explore-card-action">Book</span>
                        </div>
                        <h3 className="explore-card-title">Rain & Thunder Sound</h3>
                        <span className="explore-card-category">1:1 Session</span>
                        <p className="explore-card-desc">Immersive soundscape journey to release tension and restore calm.</p>
                    </div>
                </div>
                
                {/* Course Card */}
                <div className="explore-card course">
                    <div className="explore-card-image">
                        <img src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&h=300&fit=crop" alt="Course content" />
                    </div>
                    <div className="explore-card-content">
                        <div className="explore-card-meta">
                            <span className="explore-card-author">Auriel Hagan</span>
                            <span className="explore-card-action">8 weeks</span>
                        </div>
                        <h3 className="explore-card-title">Foundations of Breathwork</h3>
                        <span className="explore-card-category">Course</span>
                        <p className="explore-card-desc">Master ancient and modern breathing techniques for healing.</p>
                    </div>
                </div>
                
                {/* Another Circle */}
                <div className="explore-card circle">
                    <div className="explore-card-image">
                        <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop" alt="Men's circle" />
                        <div className="explore-card-badge">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                            12 members
                        </div>
                    </div>
                    <div className="explore-card-content">
                        <div className="explore-card-meta">
                            <span className="explore-card-author">Bi-weekly • Sundays</span>
                        </div>
                        <h3 className="explore-card-title">Men's Breathwork Circle</h3>
                        <span className="explore-card-category">Circle</span>
                        <p className="explore-card-desc">Brotherhood and breathwork in a supportive men's community.</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div className="explore-container">
            <div className="explore-types">
                <div className="explore-type">
                    <div className="explore-type-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>
                    </div>
                    <span>1:1 Sessions</span>
                </div>
                <div className="explore-type">
                    <div className="explore-type-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
                    </div>
                    <span>Workshops</span>
                </div>
                <div className="explore-type">
                    <div className="explore-type-icon circle-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    </div>
                    <span>Circles</span>
                </div>
                <div className="explore-type">
                    <div className="explore-type-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                    </div>
                    <span>Courses</span>
                </div>
            </div>
        </div>
    </section>


    {/* ==========================================
         FOR HEALERS SECTION - Split Layout
         ========================================== */}
    {/* ==========================================
         FOR PRACTITIONERS - Full Screen Sticky Scroll
         ========================================== */}
    <section className="practitioners-section" id="healers">
        <div className="practitioners-sticky-container">
            <div className="practitioners-sticky">
                <div className="practitioners-slides-wrapper">
                {/* Slide 1 */}
                <div className="practitioners-slide active" data-slide="0">
                    <div className="practitioners-slide-inner">
                        {/* Left: Text Content */}
                        <div className="practitioners-text">
                            <div className="practitioners-label">
                                <svg width="18" height="18" viewBox="0 0 513 513"><use href="#heelar-star-inverted"/></svg>
                                For practitioners
                            </div>
                            <h2 className="practitioners-title">Managing your healing business in a simple platform</h2>
                            <p className="practitioners-desc">Designed by practitioners, for practitioners. Heelar gives you the guidance, data and innovation you need to manage your business.</p>
                            
                            <a href="#" className="practitioners-cta" onClick="openModal('practitioner'); return false;">
                                Apply as a Practitioner
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7"/>
                                </svg>
                            </a>
                        </div>
                        
                        {/* Right: Device Mockups */}
                        <div className="practitioners-devices">
                            {/* Phone - Practitioner Dashboard */}
                            <div className="prac-phone">
                                <div className="prac-phone-frame">
                                    <div className="prac-phone-screen">
                                        <div className="prac-phone-notch"></div>
                                        
                                        {/* Status Bar */}
                                        <div className="prac-phone-status">
                                            <span>19:27</span>
                                            <div className="prac-status-icons">
                                                <svg width="16" height="10" viewBox="0 0 16 10"><path d="M1 3h2v7H1zM5 2h2v8H5zM9 1h2v9H9zM13 0h2v10h-2z" fill="currentColor"/></svg>
                                                <svg width="14" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/></svg>
                                                <svg width="22" height="10" viewBox="0 0 22 10"><rect x="0" y="1" width="18" height="8" rx="2" stroke="currentColor" fill="none" strokeWidth="1"/><rect x="2" y="3" width="12" height="4" fill="currentColor" rx="1"/><rect x="19" y="3" width="2" height="4" rx="0.5" fill="currentColor"/></svg>
                                            </div>
                                        </div>
                                        
                                        {/* Nav Header: < Dashboard Q ... */}
                                        <div className="db-nav">
                                            <svg className="db-back" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                                            <span className="db-title">Dashboard</span>
                                            <div className="db-nav-right">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                                                <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>
                                            </div>
                                        </div>
                                        
                                        {/* 5 Icon Tabs */}
                                        <div className="db-tabs">
                                            <div className="db-tab-icon">
                                                <svg viewBox="0 0 40 40" fill="none">
                                                    <path d="M20 8c-4 0-7 3-7 7 0 2 1 4 2 5l5 8 5-8c1-1 2-3 2-5 0-4-3-7-7-7z" stroke="#0f9b8e" strokeWidth="1.5" fill="none"/>
                                                    <path d="M14 28c-3 0-5 2-5 4v2h22v-2c0-2-2-4-5-4" stroke="#0f9b8e" strokeWidth="1.5" fill="none"/>
                                                    <circle cx="20" cy="15" r="2" fill="#0f9b8e"/>
                                                </svg>
                                            </div>
                                            <div className="db-tab-icon active">
                                                <svg viewBox="0 0 40 40" fill="none">
                                                    <rect x="8" y="10" width="24" height="22" rx="2" stroke="#e85a4f" strokeWidth="1.5" fill="none"/>
                                                    <path d="M8 16h24" stroke="#e85a4f" strokeWidth="1.5"/>
                                                    <path d="M14 6v6M26 6v6" stroke="#e85a4f" strokeWidth="1.5"/>
                                                    <circle cx="14" cy="22" r="1.5" fill="#e85a4f"/><circle cx="20" cy="22" r="1.5" fill="#e85a4f"/><circle cx="26" cy="22" r="1.5" fill="#e85a4f"/>
                                                    <circle cx="14" cy="27" r="1.5" fill="#e85a4f"/><circle cx="20" cy="27" r="1.5" fill="#e85a4f"/><circle cx="26" cy="27" r="1.5" fill="#e85a4f"/>
                                                </svg>
                                            </div>
                                            <div className="db-tab-icon">
                                                <svg viewBox="0 0 40 40" fill="none">
                                                    <circle cx="15" cy="14" r="5" stroke="#666" strokeWidth="1.5"/>
                                                    <circle cx="27" cy="14" r="3" stroke="#666" strokeWidth="1.5"/>
                                                    <path d="M6 32v-2c0-4 4-7 9-7s9 3 9 7v2" stroke="#666" strokeWidth="1.5"/>
                                                    <path d="M27 20c3 0 6 2 6 5v2" stroke="#666" strokeWidth="1.5"/>
                                                </svg>
                                            </div>
                                            <div className="db-tab-icon">
                                                <svg viewBox="0 0 40 40" fill="none">
                                                    <rect x="10" y="6" width="20" height="28" rx="2" stroke="#666" strokeWidth="1.5" fill="none"/>
                                                    <path d="M15 6v-2h10v2" stroke="#666" strokeWidth="1.5"/>
                                                    <path d="M14 14h12M14 20h12M14 26h8" stroke="#666" strokeWidth="1.5"/>
                                                </svg>
                                            </div>
                                            <div className="db-tab-icon">
                                                <svg viewBox="0 0 40 40" fill="none">
                                                    <path d="M20 8v24M14 12c0-2 3-4 6-4s6 2 6 4-3 4-6 4-6-2-6-4z" stroke="#0f9b8e" strokeWidth="1.5"/>
                                                    <path d="M26 28c0 2-3 4-6 4s-6-2-6-4 3-4 6-4 6 2 6 4z" stroke="#0f9b8e" strokeWidth="1.5"/>
                                                </svg>
                                            </div>
                                        </div>
                                        
                                        {/* Alert Banner */}
                                        <div className="db-alert">
                                            <span className="db-alert-text">Calendar Suspended till 12/4/23</span>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5" className="db-alert-icon">
                                                <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                                                <path d="M9 15l6 0M12 12v6" strokeWidth="1.5"/>
                                            </svg>
                                            <button className="db-reactivate">Re-activate</button>
                                        </div>
                                        
                                        {/* Booked Sessions Header */}
                                        <div className="db-section-header">
                                            <h4>Booked Sessions</h4>
                                            <span>See All</span>
                                        </div>
                                        
                                        {/* Date: 03 Jan 2023 */}
                                        <div className="db-date-row">
                                            <span>03 Jan 2023</span>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                                        </div>
                                        
                                        {/* Session Card 1 */}
                                        <div className="db-card">
                                            <img src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=100&h=100&fit=crop" className="db-card-img" alt="" />
                                            <div className="db-card-body">
                                                <div className="db-card-row1">
                                                    <strong>Crystal Healing</strong>
                                                    <button className="db-close-btn">×</button>
                                                </div>
                                                <div className="db-card-row2">
                                                    <span className="db-meta">⏱ 45m</span>
                                                    <span className="db-meta">👥 1:1</span>
                                                    <span className="db-client">Jane Goodman</span>
                                                </div>
                                                <div className="db-card-row3">
                                                    <div className="db-host">
                                                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop&crop=face" alt="" />
                                                        <div>
                                                            <strong>Jay Shanghai</strong>
                                                            <span>Location</span>
                                                        </div>
                                                    </div>
                                                    <div className="db-card-action">
                                                        <span className="db-time">14:30</span>
                                                        <button className="db-start-btn">Start</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Session Card 2 */}
                                        <div className="db-card">
                                            <img src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=100&h=100&fit=crop" className="db-card-img" alt="" />
                                            <div className="db-card-body">
                                                <div className="db-card-row1">
                                                    <strong>Crystal Healing</strong>
                                                    <button className="db-close-btn">×</button>
                                                </div>
                                                <div className="db-card-row2">
                                                    <span className="db-meta">⏱ 45m</span>
                                                    <span className="db-meta">👥 1:1</span>
                                                    <span className="db-client">Jane Goodman</span>
                                                </div>
                                                <div className="db-card-row3">
                                                    <div className="db-host">
                                                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop&crop=face" alt="" />
                                                        <div>
                                                            <strong>Jay Shanghai</strong>
                                                            <span>Location</span>
                                                        </div>
                                                    </div>
                                                    <div className="db-card-action">
                                                        <span className="db-time">15:30</span>
                                                        <button className="db-start-btn inactive">Start</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Date: 06 Jan 2023 */}
                                        <div className="db-date-row">
                                            <span>06 Jan 2023</span>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                                        </div>
                                        
                                        {/* Session Card 3 (partial) */}
                                        <div className="db-card">
                                            <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=100&h=100&fit=crop" className="db-card-img" alt="" />
                                            <div className="db-card-body">
                                                <div className="db-card-row1">
                                                    <strong>Crystal Healing</strong>
                                                    <button className="db-close-btn">×</button>
                                                </div>
                                                <div className="db-card-row2">
                                                    <span className="db-meta">⏱ 45m</span>
                                                    <span className="db-meta">👥 1:1</span>
                                                    <span className="db-client">Jane Goodman</span>
                                                </div>
                                                <div className="db-card-row3">
                                                    <div className="db-host">
                                                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop&crop=face" alt="" />
                                                        <div>
                                                            <strong>Jay Shanghai</strong>
                                                            <span>Location</span>
                                                        </div>
                                                    </div>
                                                    <div className="db-card-action">
                                                        <span className="db-time">15:30</span>
                                                        <button className="db-start-btn inactive">Start</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                    </div>
                                </div>
                            </div>
                            
                            {/* Dashboard Panel - Browser Mockup */}
                            <div className="dash-panel">
                                {/* Browser Chrome */}
                                <div className="browser-chrome">
                                    <div className="browser-dots">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                    <div className="browser-url">
                                        <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                                        <span>app.heelar.com/dashboard</span>
                                    </div>
                                </div>
                                {/* Dashboard Content */}
                                <div className="dash-content-wrap">
                                {/* Sidebar */}
                                <div className="dash-sidebar">
                                    <div className="dash-sidebar-logo">
                                        <svg viewBox="0 0 513 513" width="18" height="18"><use href="#heelar-star"/></svg>
                                        <span>Heelar</span>
                                    </div>
                                    
                                    <div className="dash-sidebar-search">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                                        <span>Search</span>
                                    </div>
                                    
                                    <div className="dash-sidebar-nav">
                                        <div className="dash-nav-item">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
                                            Dashboard
                                            <svg className="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                                        </div>
                                        <div className="dash-nav-sub">Published Sessions</div>
                                        <div className="dash-nav-sub">Calendar</div>
                                        <div className="dash-nav-sub">Availability</div>
                                        <div className="dash-nav-sub">Clients</div>
                                        <div className="dash-nav-sub">Notes</div>
                                        <div className="dash-nav-item">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 1v4m0 14v4m11-11h-4M5 12H1m16.95-6.95l-2.83 2.83M7.88 16.12l-2.83 2.83m12.9 0l-2.83-2.83M7.88 7.88L5.05 5.05"/></svg>
                                            Creator
                                        </div>
                                        <div className="dash-nav-item">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                                            Financial
                                            <svg className="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                                        </div>
                                        <div className="dash-nav-sub">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                                            Healing Sessions
                                        </div>
                                        <div className="dash-nav-sub active">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/></svg>
                                            Courses
                                        </div>
                                        <div className="dash-nav-sub">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
                                            Workshops
                                        </div>
                                        <div className="dash-nav-sub">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg>
                                            Circles
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Main Content */}
                                <div className="dash-main">
                                    {/* Top Bar */}
                                    <div className="dash-topbar">
                                        <div className="dash-topbar-left">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="dash-back-arrow"><path d="M19 12H5m7-7l-7 7 7 7"/></svg>
                                            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face" className="dash-user-avatar" alt="" />
                                            <div className="dash-user-info">
                                                <strong>Phoenix Bar</strong>
                                                <span><a href="/cdn-cgi/l/email-protection" className="__cf_email__" data-cfemail="234c4f4a554a4263444e424a4f0d404c4e">[email&#160;protected]</a></span>
                                            </div>
                                            <div className="dash-page-info">
                                                <strong>Financial - Courses</strong>
                                                <span>Course Session Revenue</span>
                                            </div>
                                        </div>
                                        <div className="dash-topbar-right">
                                            <div className="dash-search-box">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                                                <span>Search</span>
                                            </div>
                                            <button className="dash-availability-btn">Availability</button>
                                            <span className="dash-time">09:00:00</span>
                                        </div>
                                    </div>
                                    
                                    {/* Alert */}
                                    <div className="dash-alert-bar">
                                        <span>Crystal Healing Session with &lt;Client Name&gt; Starting at 9:00</span>
                                        <div className="dash-alert-actions">
                                            <button className="dash-join-btn">Join</button>
                                            <button className="dash-close-alert">×</button>
                                        </div>
                                    </div>
                                    
                                    {/* Course Sessions Sales Summary */}
                                    <h3 className="dash-section-title">Course Sessions Sales Summary</h3>
                                    
                                    <div className="dash-summary-row">
                                        {/* Achievement Circle */}
                                        <div className="dash-achievement">
                                            <div className="dash-donut">
                                                <svg viewBox="0 0 36 36">
                                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#eee" strokeWidth="3"/>
                                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--green-deep)" strokeWidth="3" stroke-dasharray="94, 100" strokeLinecap="round"/>
                                                </svg>
                                                <div className="dash-donut-text">
                                                    <small>Achievement</small>
                                                    <strong>94%</strong>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Stats Cards */}
                                        <div className="dash-stats-grid">
                                            <div className="dash-stat-card">
                                                <div className="dash-stat-header">
                                                    <span>This week</span>
                                                    <span className="dash-stat-badge">↑ 24%</span>
                                                </div>
                                                <div className="dash-stat-values">
                                                    <strong>$1,840</strong>
                                                    <span>$1,485</span>
                                                </div>
                                            </div>
                                            <div className="dash-stat-card">
                                                <div className="dash-stat-header">
                                                    <span>This Month</span>
                                                    <span className="dash-stat-badge">↑ 18%</span>
                                                </div>
                                                <div className="dash-stat-values">
                                                    <strong>$7,250</strong>
                                                    <span>$6,145</span>
                                                </div>
                                            </div>
                                            <div className="dash-stat-card">
                                                <div className="dash-stat-header">
                                                    <span>This Quarter</span>
                                                    <span className="dash-stat-badge">↑ 32%</span>
                                                </div>
                                                <div className="dash-stat-values">
                                                    <strong>$24,680</strong>
                                                    <span>$18,720</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Top Countries */}
                                    <h3 className="dash-section-title">Top countries summary</h3>
                                    
                                    <div className="dash-countries-row">
                                        <div className="dash-country-card">
                                            <div className="dash-country-header">
                                                <span>1 - United States</span>
                                                <span className="dash-more">⋮</span>
                                            </div>
                                            <div className="dash-country-value">$4,285</div>
                                            <div className="dash-country-footer">
                                                <span className="dash-country-change">↑ 28%</span>
                                                <span>vs last month</span>
                                                <svg className="dash-sparkline" viewBox="0 0 50 20"><path d="M0 15 L10 12 L20 14 L30 8 L40 10 L50 5" fill="none" stroke="var(--green-deep)" strokeWidth="1.5"/></svg>
                                            </div>
                                        </div>
                                        <div className="dash-country-card">
                                            <div className="dash-country-header">
                                                <span>2 - United Kingdom</span>
                                                <span className="dash-more">⋮</span>
                                            </div>
                                            <div className="dash-country-value">$1,840</div>
                                            <div className="dash-country-footer">
                                                <span className="dash-country-change">↑ 15%</span>
                                                <span>vs last month</span>
                                                <svg className="dash-sparkline" viewBox="0 0 50 20"><path d="M0 12 L10 14 L20 10 L30 12 L40 8 L50 6" fill="none" stroke="var(--green-deep)" strokeWidth="1.5"/></svg>
                                            </div>
                                        </div>
                                        <div className="dash-country-card">
                                            <div className="dash-country-header">
                                                <span>3 - Australia</span>
                                                <span className="dash-more">⋮</span>
                                            </div>
                                            <div className="dash-country-value">$925</div>
                                            <div className="dash-country-footer">
                                                <span className="dash-country-change">↑ 42%</span>
                                                <span>vs last month</span>
                                                <svg className="dash-sparkline" viewBox="0 0 50 20"><path d="M0 10 L10 12 L20 8 L30 10 L40 6 L50 8" fill="none" stroke="var(--green-deep)" strokeWidth="1.5"/></svg>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Monthly Summary */}
                                    <div className="dash-monthly-header">
                                        <h3 className="dash-section-title">Monthly Summary</h3>
                                        <div className="dash-monthly-controls">
                                            <select className="dash-year-select">
                                                <option>2023</option>
                                            </select>
                                            <button className="dash-chart-btn">📊</button>
                                        </div>
                                    </div>
                                    
                                    <div className="dash-chart-container">
                                        <div className="dash-chart-y">
                                            <span>1,000</span>
                                            <span>800</span>
                                            <span>600</span>
                                            <span>400</span>
                                            <span>200</span>
                                            <span>0</span>
                                        </div>
                                        <div className="dash-chart-area">
                                            <svg viewBox="0 0 300 80" preserveAspectRatio="none" className="dash-line-chart">
                                                {/* Grid lines */}
                                                <line x1="0" y1="16" x2="300" y2="16" stroke="#eee" strokeWidth="0.5"/>
                                                <line x1="0" y1="32" x2="300" y2="32" stroke="#eee" strokeWidth="0.5"/>
                                                <line x1="0" y1="48" x2="300" y2="48" stroke="#eee" strokeWidth="0.5"/>
                                                <line x1="0" y1="64" x2="300" y2="64" stroke="#eee" strokeWidth="0.5"/>
                                                {/* Line 1 - Top */}
                                                <path d="M0 25 L25 22 L50 20 L75 24 L100 22 L125 18 L150 20 L175 15 L200 12 L225 10 L250 8 L275 6 L300 5" fill="none" stroke="var(--green-deep)" strokeWidth="1.5"/>
                                                {/* Line 2 - Middle */}
                                                <path d="M0 40 L25 38 L50 42 L75 40 L100 35 L125 38 L150 32 L175 30 L200 28 L225 25 L250 22 L275 20 L300 18" fill="none" stroke="#6bb89d" strokeWidth="1.5"/>
                                                {/* Line 3 - Lower */}
                                                <path d="M0 55 L25 58 L50 52 L75 55 L100 50 L125 48 L150 52 L175 45 L200 42 L225 38 L250 35 L275 32 L300 30" fill="none" stroke="#a8d5c2" strokeWidth="1.5"/>
                                            </svg>
                                            <div className="dash-chart-x">
                                                <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                </div>{/* /dash-content-wrap */}
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Slide 2: Community of Practitioners */}
                <div className="practitioners-slide" data-slide="1">
                    <div className="practitioners-slide-inner">
                        <div className="practitioners-text">
                            <div className="practitioners-label">
                                <svg width="18" height="18" viewBox="0 0 513 513"><use href="#heelar-star-inverted"/></svg>
                                For practitioners
                            </div>
                            <h2 className="practitioners-title">Touch someone's life and make a difference</h2>
                            <p className="practitioners-desc">Share the gift of your healing with others. Join a community of vetted practitioners making real impact.</p>
                            
                            <a href="#" className="practitioners-cta" onClick="openModal('practitioner'); return false;">
                                Sign up as a Healer
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7"/>
                                </svg>
                            </a>
                        </div>
                        
                        {/* Right: Photo Collage */}
                        <div className="practitioners-collage">
                            <div className="collage-col collage-col-1">
                                <div className="collage-photo">
                                    <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=560&fit=crop&crop=face" alt="Healer" />
                                </div>
                            </div>
                            <div className="collage-col collage-col-2">
                                <div className="collage-photo">
                                    <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=360&h=400&fit=crop&crop=face" alt="Healer" />
                                </div>
                                <div className="collage-photo">
                                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=360&h=440&fit=crop&crop=face" alt="Healer" />
                                </div>
                            </div>
                            <div className="collage-col collage-col-3">
                                <div className="collage-photo">
                                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=360&h=440&fit=crop&crop=face" alt="Healer" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Slide 3: Features Grid */}
                <div className="practitioners-slide" data-slide="2">
                    <div className="features-grid-slide">
                        {/* Header */}
                        <div className="features-grid-header">
                            <div className="practitioners-label">
                                <svg width="18" height="18" viewBox="0 0 513 513"><use href="#heelar-star-inverted"/></svg>
                                Features
                            </div>
                            <h2 className="practitioners-title">Creating Change Faster</h2>
                            <p className="practitioners-desc">Powerful marketing and financial management tools created by Healers for Healers.</p>
                        </div>
                        
                        {/* Features Grid */}
                        <div className="features-grid">
                            {/* Row 1 */}
                            <div className="feature-card">
                                <div className="feature-card-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                                </div>
                                <h3>Exchange energies</h3>
                                <p>We create a safe space where one can be heard and hear themselves, and in doing so learn to let go.</p>
                            </div>
                            
                            <div className="feature-card">
                                <div className="feature-card-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                                </div>
                                <h3>Learn to let go</h3>
                                <p>We are a guiding force for those that want to release the pain and create new possibilities in their lives.</p>
                            </div>
                            
                            <div className="feature-card">
                                <div className="feature-card-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M9 16l2 2 4-4"/></svg>
                                </div>
                                <h3>Creating change</h3>
                                <p>Healing begins by acknowledging the pain, seeking help through healers and discovering the truth.</p>
                            </div>
                            
                            {/* Row 2 */}
                            <div className="feature-card">
                                <div className="feature-card-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                </div>
                                <h3>Discovering you</h3>
                                <p>We make healing a continuous journey, where emotions are expressed transparently so as to find what you truly desire.</p>
                            </div>
                            
                            <div className="feature-card">
                                <div className="feature-card-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                </div>
                                <h3>Building relationships</h3>
                                <p>Connect with practitioners who understand your journey and build meaningful, lasting bonds through shared healing experiences.</p>
                            </div>
                            
                            <div className="feature-card">
                                <div className="feature-card-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                                </div>
                                <h3>Making a difference</h3>
                                <p>Every session creates ripples of positive change. Join a community dedicated to transforming lives, one healing at a time.</p>
                            </div>
                        </div>
                    </div>
                </div>
                </div>{/* End slides wrapper */}
                
                {/* Progress Dots (Desktop) */}
                <div className="practitioners-dots">
                    <button className="practitioners-dot active" data-slide="0"></button>
                    <button className="practitioners-dot" data-slide="1"></button>
                    <button className="practitioners-dot" data-slide="2"></button>
                </div>
            </div>
            
            {/* Mobile Swipe Dots */}
            <div className="practitioners-mobile-dots">
                <button className="practitioners-mobile-dot active" data-slide="0"></button>
                <button className="practitioners-mobile-dot" data-slide="1"></button>
                <button className="practitioners-mobile-dot" data-slide="2"></button>
            </div>
        </div>
    </section>

    {/* ==========================================
         MEET OUR HEALERS SECTION - Gated Video Offer
         ========================================== */}
    <section className="aaron-section" id="healers-intro">
        <div className="container">
            <div className="aaron-wrapper">
                <div className="aaron-card reveal-scale">
                    {/* Header at Top */}
                    <div className="aaron-header">
                        <div className="aaron-label">
                            <svg width="18" height="18" viewBox="0 0 513 513"><use href="#heelar-star"/></svg>
                            Our community
                        </div>
                        <h2 className="aaron-heading">Meet our healers</h2>
                        <p className="aaron-subheading">Vetted practitioners from around the world, each bringing their unique journey and expertise to help you heal</p>
                    </div>
                    
                    {/* Main Content: Profile + Gated Video */}
                    <div className="aaron-profile-layout">
                    {/* Left: Profile */}
                    <div className="aaron-profile-card">
                        <div className="aaron-avatar">
                            <span>Aaron's Photo</span>
                        </div>
                        <h3 className="aaron-name">Aaron Quinn</h3>
                        <p className="aaron-role">Yoga & Meditation Teacher</p>
                        <p className="aaron-bio">One of our founding healers, Aaron traded Dublin's corporate world for the mat. After two years studying with masters in Rishikesh, he now helps others find the same stillness he discovered.</p>
                        <div className="aaron-tags">
                            <span>Ashtanga</span>
                            <span>Meditation</span>
                            <span>Breathwork</span>
                        </div>
                    </div>
                    
                    {/* Right: Gated Video */}
                    <div className="aaron-video-container">
                        <div className="aaron-video-player">
                            <div className="aaron-video-frame">
                                <img src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=450&fit=crop" alt="Yoga practice at sunset" />
                                <div className="aaron-video-overlay"></div>
                                
                                {/* Lock/Gate Overlay */}
                                <div className="aaron-gate-overlay">
                                    <div className="aaron-gate-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                            <path d="M7 11V7a5 5 0 0110 0v4"/>
                                        </svg>
                                    </div>
                                    <h4 className="aaron-gate-title">A 20-Minute Grounding Practice</h4>
                                    <p className="aaron-gate-desc">Join the waitlist and get free access to this exclusive guided session from one of our healers.</p>
                                    
                                    <form className="aaron-signup-form" id="aaronSignupForm">
                                        <input type="email" placeholder="Enter your email" required className="aaron-email-input" />
                                        <button type="submit" className="aaron-submit-btn">
                                            Unlock Free Video
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M5 12h14M12 5l7 7-7 7"/>
                                            </svg>
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </div>
    </section>

    {/* ==========================================
         MISSION STATEMENT SECTION
         ========================================== */}
    <section className="mission-section">
        <div className="container">
            <div className="mission-content animate-on-scroll">
                <div className="mission-star">
                    <svg width="48" height="48" viewBox="0 0 513 513"><use href="#heelar-star"/></svg>
                </div>
                <blockquote className="mission-quote">
                    We envision a world where authenticity is celebrated, vulnerability is embraced, and individuals are empowered to speak their truth without fear.
                </blockquote>
                <p className="mission-tagline">Creating Change <em>Within</em></p>
            </div>
        </div>
    </section>

    {/* ==========================================
         FOOTER (with CTA)
         ========================================== */}
    <footer id="waitlist">
        <div className="container">
            <div className="footer-content">
                {/* CTA Section */}
                <div className="footer-cta">
                    <h2>Ready to begin your journey?</h2>
                    <p>Join thousands on the waitlist. Be the first to experience Heelar when we launch.</p>
                    <div className="footer-cta-buttons">
                        <button className="btn btn-light" onClick={() => openModal('client')}>Join the Client Waitlist</button>
                        <button className="btn btn-outline-light" onClick={() => openModal('practitioner')}>I'm a Practitioner</button>
                    </div>
                </div>
                
                {/* Divider */}
                <div className="footer-divider"></div>
                
                {/* Brand */}
                <div className="footer-brand">
                    <div className="footer-star">
                        <svg width="36" height="36" viewBox="0 0 513 513"><use href="#heelar-star"/></svg>
                    </div>
                    <svg className="footer-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 303 85" fill="none">
                        <path d="M59.8 50.4V81.4C59.8 82.5333 59.3667 83.3333 58.5 83.8C57.6333 84.2 56.7667 84.2 55.9 83.8C55.0333 83.3333 54.6 82.5333 54.6 81.4V52.6H15.2V81.4C15.2 82.5333 14.7667 83.3333 13.9 83.8C13.0333 84.2 12.1667 84.2 11.3 83.8C10.4333 83.3333 10 82.5333 10 81.4V50.4V49.6V18.6C10 17.4667 10.4333 16.7 11.3 16.3C12.1667 15.8333 13.0333 15.8333 13.9 16.3C14.7667 16.7 15.2 17.4667 15.2 18.6V47.4H54.6V18.6C54.6 17.4667 55.0333 16.7 55.9 16.3C56.7667 15.8333 57.6333 15.8333 58.5 16.3C59.3667 16.7 59.8 17.4667 59.8 18.6V49.6C59.8 50.1333 59.8 50.4 59.8 50.4ZM110.524 71.4C111.524 70 112.724 69.8 114.124 70.8C115.524 71.8 115.724 73 114.724 74.4C110.191 80.8667 103.891 84.0667 95.8242 84C89.8242 84 84.6576 81.7333 80.3242 77.2C76.0576 72.6 73.8909 67 73.8242 60.4C73.8242 59.8667 73.8242 59.6 73.8242 59.6C73.8909 55.2667 74.9242 51.3 76.9242 47.7C78.9242 44.0333 81.5909 41.1667 84.9242 39.1C88.2576 37.0333 91.8909 36 95.8242 36C101.958 36 107.158 38.4667 111.424 43.4C115.691 48.3333 117.824 54.7333 117.824 62.6H79.2242C79.7576 67.2 81.5909 71.0667 84.7242 74.2C87.8576 77.2667 91.5576 78.8 95.8242 78.8C101.958 78.8667 106.858 76.4 110.524 71.4ZM79.2242 57.4H112.624C112.624 54.8 111.891 52.2667 110.424 49.8C108.958 47.3333 106.891 45.3 104.224 43.7C101.624 42.0333 98.8242 41.2 95.8242 41.2C91.5576 41.2 87.8576 42.7667 84.7242 45.9C81.5909 48.9667 79.7576 52.8 79.2242 57.4ZM162.477 71.4C163.477 70 164.677 69.8 166.077 70.8C167.477 71.8 167.677 73 166.677 74.4C162.144 80.8667 155.844 84.0667 147.777 84C141.777 84 136.611 81.7333 132.277 77.2C128.011 72.6 125.844 67 125.777 60.4C125.777 59.8667 125.777 59.6 125.777 59.6C125.844 55.2667 126.877 51.3 128.877 47.7C130.877 44.0333 133.544 41.1667 136.877 39.1C140.211 37.0333 143.844 36 147.777 36C153.911 36 159.111 38.4667 163.377 43.4C167.644 48.3333 169.777 54.7333 169.777 62.6H131.177C131.711 67.2 133.544 71.0667 136.677 74.2C139.811 77.2667 143.511 78.8 147.777 78.8C153.911 78.8667 158.811 76.4 162.477 71.4ZM131.177 57.4H164.577C164.577 54.8 163.844 52.2667 162.377 49.8C160.911 47.3333 158.844 45.3 156.177 43.7C153.577 42.0333 150.777 41.2 147.777 41.2C143.511 41.2 139.811 42.7667 136.677 45.9C133.544 48.9667 131.711 52.8 131.177 57.4ZM181.73 16C181.73 14.8667 182.164 14.1 183.03 13.7C183.897 13.2333 184.764 13.2333 185.63 13.7C186.497 14.1 186.93 14.8667 186.93 16V81.4C186.93 82.5333 186.497 83.3333 185.63 83.8C184.764 84.2 183.897 84.2 183.03 83.8C182.164 83.3333 181.73 82.5333 181.73 81.4V16ZM197.066 60C197.066 53.2667 199.2 47.6 203.466 43C207.8 38.3333 213 36 219.066 36C222.333 36 225.433 36.7667 228.366 38.3C231.3 39.7667 233.8 41.8333 235.866 44.5V38.6C235.866 38.0667 236 37.6 236.266 37.2C236.533 36.7333 236.833 36.4333 237.166 36.3C237.566 36.1 238 36 238.466 36C238.933 36 239.333 36.1 239.666 36.3C240.066 36.4333 240.4 36.7333 240.666 37.2C240.933 37.6 241.066 38.0667 241.066 38.6V60V81.4C241.066 82.5333 240.633 83.3333 239.766 83.8C238.9 84.2 238.033 84.2 237.166 83.8C236.3 83.3333 235.866 82.5333 235.866 81.4V75.5C233.8 78.1667 231.3 80.2667 228.366 81.8C225.433 83.2667 222.333 84 219.066 84C213 84 207.8 81.7 203.466 77.1C199.2 72.4333 197.066 66.7333 197.066 60ZM202.266 60C202.266 65.2 203.9 69.6333 207.166 73.3C210.433 76.9667 214.4 78.8 219.066 78.8C222.133 78.8 224.966 77.9667 227.566 76.3C230.166 74.5667 232.2 72.2667 233.666 69.4C235.133 66.5333 235.866 63.4 235.866 60C235.866 54.8 234.233 50.3667 230.966 46.7C227.7 43.0333 223.733 41.2 219.066 41.2C214.4 41.2 210.433 43.0333 207.166 46.7C203.9 50.3667 202.266 54.8 202.266 60ZM262.223 43.3C266.29 38.4333 271.957 36 279.223 36C280.023 36 280.657 36.2667 281.123 36.8C281.59 37.3333 281.823 37.9333 281.823 38.6C281.823 39.2667 281.59 39.8667 281.123 40.4C280.657 40.9333 280.023 41.2 279.223 41.2C275.89 41.2 272.957 41.9 270.423 43.3C267.89 44.7 265.89 46.8 264.423 49.6C262.957 52.4 262.223 55.7 262.223 59.5V60V81.4C262.223 82.5333 261.79 83.3333 260.923 83.8C260.057 84.2 259.19 84.2 258.323 83.8C257.457 83.3333 257.023 82.5333 257.023 81.4V60V59.8C257.023 59.6667 257.023 59.5667 257.023 59.5V38.6C257.023 38.0667 257.157 37.6 257.423 37.2C257.69 36.7333 257.99 36.4333 258.323 36.3C258.723 36.1 259.157 36 259.623 36C260.09 36 260.49 36.1 260.823 36.3C261.223 36.4333 261.557 36.7333 261.823 37.2C262.09 37.6 262.223 38.0667 262.223 38.6V43.3Z" fill="white"/>
                        <path d="M292.609 13.2524C292.609 13.2524 293.694 18.4462 296.027 20.5666C298.033 22.3895 302.421 23.2671 302.421 23.2671C302.421 23.2671 297.959 23.9844 295.948 25.8087C293.711 27.8366 292.731 32.838 292.731 32.838C292.731 32.838 292.11 28.7354 290.507 26.8016C288.443 24.3124 283 23.3068 283 23.3068C283 23.3068 286.828 22.8028 288.72 21.4006C289.955 20.4848 290.574 19.795 291.341 18.4618C292.384 16.6466 292.609 13.2524 292.609 13.2524Z" fill="white"/>
                        <path d="M292.839 18.0837C292.839 18.0837 293.398 20.7356 294.599 21.8182C295.632 22.7489 297.892 23.197 297.892 23.197C297.892 23.197 295.594 23.5633 294.558 24.4947C293.407 25.5301 292.902 28.0837 292.902 28.0837C292.902 28.0837 292.583 25.9891 291.757 25.0017C290.694 23.7307 287.892 23.2173 287.892 23.2173C287.892 23.2173 289.863 22.96 290.837 22.244C291.473 21.7764 291.792 21.4243 292.186 20.7435C292.724 19.8167 292.839 18.0837 292.839 18.0837Z" fill="#0f4e29"/>
                    </svg>
                    <p className="footer-tagline">Creating Change Within</p>
                </div>
                
                {/* Social Links */}
                <div className="social-links">
                    <a href="#" className="social-link" aria-label="Instagram">
                        <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                    </a>
                    <a href="#" className="social-link" aria-label="Facebook">
                        <svg viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </a>
                    <a href="#" className="social-link" aria-label="LinkedIn">
                        <svg viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    </a>
                </div>
                
                {/* Links & Copyright */}
                <div className="footer-links">
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Service</a>
                    <a href="#">Contact</a>
                </div>
                <p className="footer-copyright">© 2026 Heelar LLC. All rights reserved.</p>
            </div>
        </div>
    </footer>
    {/* ==========================================
         EMAIL CAPTURE MODAL
         ========================================== */}
    <div className={`modal-backdrop ${modalOpen ? 'active' : ''}`} id="modalBackdrop" onClick={closeModal}></div>
    <div className={`modal ${modalOpen ? 'active' : ''}`} id="modal">
        <button className="modal-close" onClick={closeModal}>
            <svg><use href="#icon-close"/></svg>
        </button>
        
        <h2 className="modal-title" id="modalTitle">
          {modalType === 'practitioner' ? 'Apply as a Practitioner' : 'Join the Waitlist'}
        </h2>
        <p className="modal-subtitle" id="modalSubtitle">
          {modalType === 'practitioner' 
            ? "Join our community of healing practitioners. We'll reach out with next steps."
            : "Be the first to know when Heelar launches. We'll send you early access and updates."}
        </p>
        
        <form className={`modal-form ${formSubmitted ? 'hidden' : ''}`} id="modalForm" onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="form-label" htmlFor="name">Your Name</label>
                <input type="text" id="name" className="form-input" placeholder="Enter your name" required />
            </div>
            <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address</label>
                <input type="email" id="email" className="form-input" placeholder="you@example.com" required />
            </div>
            <div className="form-group" id="interestGroup">
                <label className="form-label" htmlFor="interest">
                  {modalType === 'practitioner' ? 'Your primary modality' : 'What brings you to Heelar?'}
                </label>
                <select id="interest" className="form-select" required defaultValue="">
                    {modalType === 'practitioner' ? (
                      <>
                        <option value="" disabled>Select your modality</option>
                        <option value="reiki">Reiki</option>
                        <option value="breathwork">Breathwork</option>
                        <option value="sound-healing">Sound Healing</option>
                        <option value="yoga">Yoga</option>
                        <option value="meditation">Meditation</option>
                        <option value="hypnotherapy">Hypnotherapy</option>
                        <option value="other">Other</option>
                      </>
                    ) : (
                      <>
                        <option value="" disabled>Select an option</option>
                        <option value="seeking-healing">I'm seeking healing support</option>
                        <option value="curious">I'm curious to explore</option>
                        <option value="specific-modality">Looking for a specific modality</option>
                        <option value="community">I want to join a community</option>
                        <option value="other">Other</option>
                      </>
                    )}
                </select>
            </div>
            <button type="submit" className="btn btn-primary modal-submit" style={{width: '100%'}}>
                {modalType === 'practitioner' ? 'Apply Now' : 'Join the Waitlist'}
            </button>
        </form>
        
        <div className={`modal-success ${formSubmitted ? 'active' : ''}`} id="modalSuccess">
            <div className="success-icon">
                <svg><use href="#icon-check"/></svg>
            </div>
            <h3 className="success-title">You're on the list!</h3>
            <p className="success-message">We'll be in touch soon with updates and early access. Thank you for joining the Heelar community.</p>
        </div>
        
        <p className="modal-footer">
            By joining, you agree to our <a href="#">Privacy Policy</a>
        </p>
    </div>

    {/* ==========================================
         JAVASCRIPT
         ========================================== */}
    </>
  )
}

export default App
