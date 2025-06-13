document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('timelineCanvas');
  const ctx = canvas.getContext('2d');

  // Drawing Parameters
  const CANVAS_WIDTH = canvas.width;
  const CANVAS_HEIGHT = canvas.height;
  const PADDING = 50;
  const ROW_HEIGHT = 40;
  const HEADER_HEIGHT = 50;
  const TASK_LABEL_WIDTH = 150;
  const START_YEAR = 2025;
  const END_YEAR = 2040;
  const YEAR_SPAN = END_YEAR - START_YEAR + 1;
  const TIMELINE_AREA_WIDTH = CANVAS_WIDTH - PADDING * 2 - TASK_LABEL_WIDTH;
  const YEAR_COLUMN_WIDTH = TIMELINE_AREA_WIDTH / YEAR_SPAN;
  // Updated Color Palette
  const BAR_COLOR = "#D81E05"; // Coke Red
  const LIGHT_BAR_COLOR = "#F04438"; // Lighter Red
  const DARK_BAR_COLOR = "#A01203"; // Darker Red
  const BACKGROUND_COLOR = "#FFF8DC"; // Cornsilk (Cream/Off-white)
  const TEXT_COLOR = "#4A2C2A"; // Dark Brown
  const FRAME_COLOR = "#4A2C2A"; // Dark Brown for frame and grid lines

  // Updated Font
  const FONT_FAMILY = "Georgia, serif";
  const FONT = `14px ${FONT_FAMILY}`;
  const YEAR_LABEL_STEP = 2;


  // Main drawing function
  function drawTimeline(tasks) {
    console.log('drawTimeline called with', tasks.length, 'tasks.');
    // Fill background
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    // ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); // ClearRect is not needed if filling background

    // Draw Frame
    ctx.strokeStyle = FRAME_COLOR;
    ctx.lineWidth = 2;
    ctx.strokeRect(PADDING, PADDING, CANVAS_WIDTH - PADDING * 2, CANVAS_HEIGHT - PADDING * 2);
    ctx.lineWidth = 1; // Reset line width

    // Draw Year Labels and Vertical Grid Lines
    ctx.font = FONT; // Ensure font is set
    ctx.textAlign = 'center';

    const gridStartY = PADDING + HEADER_HEIGHT;
    const actualTimelineContentHeight = tasks.length * ROW_HEIGHT;
    // Ensure grid lines don't extend beyond the frame at the bottom
    const maxGridEndY = CANVAS_HEIGHT - PADDING;
    const gridEndY = Math.min(gridStartY + actualTimelineContentHeight, maxGridEndY);

    for (let year = START_YEAR; year <= END_YEAR; year++) {
        if ((year - START_YEAR) % YEAR_LABEL_STEP === 0) {
            // Calculate x position for the center of the year's column segment
            const xPositionForYearText = PADDING + TASK_LABEL_WIDTH + (year - START_YEAR + 0.5 * YEAR_LABEL_STEP) * YEAR_COLUMN_WIDTH;
            // Grid line at the end of the full year column (or step)
            const xPositionForGridLine = PADDING + TASK_LABEL_WIDTH + (year - START_YEAR + YEAR_LABEL_STEP) * YEAR_COLUMN_WIDTH;

            ctx.fillStyle = TEXT_COLOR;
            ctx.fillText(year.toString(), xPositionForYearText, PADDING + HEADER_HEIGHT / 2);

            // Draw grid line only if it's not the very last year and it's within the main timeline area
            if (year < END_YEAR && (year - START_YEAR + YEAR_LABEL_STEP) <= YEAR_SPAN) {
                ctx.strokeStyle = FRAME_COLOR;
                ctx.globalAlpha = 0.3; // Make grid lines less prominent
                ctx.beginPath();
                ctx.moveTo(xPositionForGridLine, gridStartY);
                ctx.lineTo(xPositionForGridLine, gridEndY > gridStartY ? gridEndY : gridStartY + HEADER_HEIGHT); // Ensure line has some height
                ctx.stroke();
                ctx.globalAlpha = 1.0; // Reset alpha
            }
        }
    }
    ctx.textAlign = "left"; // Reset textAlign

    // Draw Task Names and Horizontal Lines
    tasks.forEach((task, i) => {
      const yText = PADDING + HEADER_HEIGHT + i * ROW_HEIGHT + ROW_HEIGHT / 2 + 5; // +5 for better vertical centering of text
      const yLine = PADDING + HEADER_HEIGHT + (i + 1) * ROW_HEIGHT; // Line at the bottom of the row

      // Draw the task name
      ctx.fillStyle = TEXT_COLOR;
      ctx.font = FONT; // Font is already updated via constant
      ctx.textAlign = "right";
      ctx.fillText(task["task name"], PADDING + TASK_LABEL_WIDTH - 10, yText);
      ctx.textAlign = "left"; // Reset for other text

      // Horizontal lines for task rows are removed as per requirement.

      // Draw the task bar
      const taskStartYear = task.start;
      const taskEndYear = task.end;

      // Calculate bar position and width
      // Ensure task years are within the timeline range for drawing
      const clampedTaskStartYear = Math.max(taskStartYear, START_YEAR);
      const clampedTaskEndYear = Math.min(taskEndYear, END_YEAR);

      // Only draw if the task duration is within the displayable range
      if (clampedTaskStartYear <= clampedTaskEndYear) {
        const barStartX = PADDING + TASK_LABEL_WIDTH + (clampedTaskStartYear - START_YEAR) * YEAR_COLUMN_WIDTH;
        // Add 1 to taskEndYear to make the bar span the entire year block
        const barEndX = PADDING + TASK_LABEL_WIDTH + (clampedTaskEndYear - START_YEAR + 1) * YEAR_COLUMN_WIDTH;
        const barWidth = barEndX - barStartX;

        const barHeight = ROW_HEIGHT * 0.3; // Thinner bars
        const barY = PADDING + HEADER_HEIGHT + i * ROW_HEIGHT + (ROW_HEIGHT - barHeight) / 2; // Recalculate Y to center the thinner bar

        // Apply gradient for "glisten" effect
        const gradient = ctx.createLinearGradient(barStartX, barY, barStartX, barY + barHeight);
        gradient.addColorStop(0, LIGHT_BAR_COLOR);   // Lighter at the top
        gradient.addColorStop(0.5, BAR_COLOR);       // Original in the middle
        gradient.addColorStop(1, DARK_BAR_COLOR);    // Darker at the bottom

        ctx.fillStyle = gradient;
        ctx.fillRect(barStartX, barY, barWidth, barHeight);
      }
    });

    console.log("Year labels, task names, grid lines, and task bars drawn.");
  }

  function loadDataAndDraw(tasks = null) { // Modified to accept tasks or draw initial state
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    if (tasks) {
      drawTimeline(tasks);
    } else {
      // Draw initial message
      ctx.font = "16px Arial";
      ctx.fillStyle = TEXT_COLOR; // Use defined TEXT_COLOR
      ctx.textAlign = 'center';
      ctx.fillText('Please select a JSON file to visualize.', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      console.log("Initial canvas state drawn: 'Please select a JSON file'.");
    }
  }

  const fileInput = document.getElementById('jsonFile');
  fileInput.addEventListener('change', handleFileSelect, false);

  function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = function(e) {
        const fileContent = e.target.result;
        try {
          const tasks = JSON.parse(fileContent);
          // Validate if tasks is an array, basic check
          if (!Array.isArray(tasks)) {
            throw new Error("JSON root is not an array.");
          }
          // Further validation of task structure could be added here
          // e.g., checking if tasks have 'start', 'end', 'task name'
          loadDataAndDraw(tasks); // Call loadDataAndDraw to then call drawTimeline
          generatedSvgData = generateSvgString(tasks); // Generate and store SVG string
          // Optional: Update the hidden SVG container for debugging
          // const svgContainer = document.getElementById('svgContainer');
          // if (svgContainer) { svgContainer.innerHTML = window.generatedSvgData; }

        } catch (error) {
          console.error("Error parsing JSON:", error);
          ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          ctx.fillStyle = 'red';
          ctx.font = "16px Arial";
          ctx.textAlign = 'center';
          ctx.fillText('Error parsing JSON file. Check console for details.', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        }
      };

      reader.onerror = function() {
        console.error("Error reading file:", reader.error);
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = 'red';
        ctx.font = "16px Arial";
        ctx.textAlign = 'center';
        ctx.fillText('Error reading file. Check console for details.', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      };

      reader.readAsText(file);
    } else {
      // No file selected, or file selection was cancelled.
      // Optionally, redraw the initial "Please select" message or do nothing.
      loadDataAndDraw(); // Redraw initial state
    }
  }

  // Initial call to set up the canvas with a message
  loadDataAndDraw();

  const downloadButton = document.getElementById('downloadSvgButton');
  if (downloadButton) {
    downloadButton.addEventListener('click', function() {
      if (typeof generatedSvgData !== 'string' || !generatedSvgData) {
        alert('No SVG data to download. Please load a JSON file first.');
        return;
      }

      const blob = new Blob([generatedSvgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'timeline.svg';

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url);
    });
  }

  // --- SVG Export Logic ---
  function escapeXml(unsafe) {
    if (typeof unsafe !== 'string') return '';
    return unsafe.replace(/[<>&"']/g, function (match) {
        switch (match) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '"': return '&quot;';
            case "'": return '&apos;';
            default: return match;
        }
    });
  }

  function generateSvgString(tasks) {
    const svgWidth = CANVAS_WIDTH;
    const svgHeight = CANVAS_HEIGHT;
    const svgElements = [];

    svgElements.push(`<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg" style="font-family: ${FONT_FAMILY};">`);
    svgElements.push(`<rect width="100%" height="100%" fill="${BACKGROUND_COLOR}"/>`);
    svgElements.push(`<rect x="${PADDING}" y="${PADDING}" width="${svgWidth - PADDING * 2}" height="${svgHeight - PADDING * 2}" fill="none" stroke="${FRAME_COLOR}" stroke-width="2"/>`);

    // Year Labels and Grid Lines
    const gridStartY = PADDING + HEADER_HEIGHT;
    const actualTimelineHeight = tasks.length * ROW_HEIGHT;
    const maxGridEndY = svgHeight - PADDING;
    const gridEndY = Math.min(gridStartY + actualTimelineHeight, maxGridEndY);

    for (let year = START_YEAR; year <= END_YEAR; year++) {
        if ((year - START_YEAR) % YEAR_LABEL_STEP === 0) {
            const yearTextX = PADDING + TASK_LABEL_WIDTH + (year - START_YEAR + 0.5 * YEAR_LABEL_STEP) * YEAR_COLUMN_WIDTH;
            // Adjusted y for SVG text (baseline)
            svgElements.push(`<text x="${yearTextX}" y="${PADDING + HEADER_HEIGHT / 2 + 5}" fill="${TEXT_COLOR}" text-anchor="middle" font-size="14px">${year}</text>`);

            const gridLineX = PADDING + TASK_LABEL_WIDTH + (year - START_YEAR + YEAR_LABEL_STEP) * YEAR_COLUMN_WIDTH;
            if ((year - START_YEAR + YEAR_LABEL_STEP) <= YEAR_SPAN) {
                 svgElements.push(`<line x1="${gridLineX}" y1="${gridStartY}" x2="${gridLineX}" y2="${gridEndY > gridStartY ? gridEndY : gridStartY + HEADER_HEIGHT}" stroke="${FRAME_COLOR}" stroke-opacity="0.3" stroke-width="1"/>`);
            }
        }
    }

    // Task Bars and Labels
    tasks.forEach((task, i) => {
        const taskYBase = PADDING + HEADER_HEIGHT + i * ROW_HEIGHT;

        const labelX = PADDING + TASK_LABEL_WIDTH - 10;
        const labelY = taskYBase + ROW_HEIGHT / 2 + 5; // +5 for baseline adjustment
        svgElements.push(`<text x="${labelX}" y="${labelY}" fill="${TEXT_COLOR}" text-anchor="end" font-size="14px">${escapeXml(task["task name"])}</text>`);

        const barHeight = ROW_HEIGHT * 0.3;
        const barY = taskYBase + (ROW_HEIGHT - barHeight) / 2;

        const clampedTaskStartYear = Math.max(task.start, START_YEAR);
        const clampedTaskEndYear = Math.min(task.end, END_YEAR);

        if (clampedTaskStartYear <= clampedTaskEndYear) {
            const barStartX = PADDING + TASK_LABEL_WIDTH + (clampedTaskStartYear - START_YEAR) * YEAR_COLUMN_WIDTH;
            const barWidth = Math.max(0, (clampedTaskEndYear - clampedTaskStartYear + 1) * YEAR_COLUMN_WIDTH);

            if (barWidth > 0) {
                // Using BAR_COLOR directly, no gradient for this SVG version
                svgElements.push(`<rect x="${barStartX}" y="${barY}" width="${barWidth}" height="${barHeight}" fill="${BAR_COLOR}"/>`);
            }
        }
    });

    svgElements.push('</svg>');
    return svgElements.join('\n');
  }

});

// Moved generatedSvgData to global scope to be accessible by download handler not defined yet.
// This is a temporary measure; a more robust solution might involve a class or module.
var generatedSvgData = '';

console.log("script.js loaded, DOMContentLoaded listener added, and file input handler set up.");
// Note: Event listener for download button is not yet added.
// Note: generatedSvgData is now global.
// In handleFileSelect, after successfully parsing the JSON and calling loadDataAndDraw(tasks);
// Add: generatedSvgData = generateSvgString(tasks);
// This change needs to be made in the handleFileSelect function.
// The current diff tool doesn't allow modifying multiple distinct places easily in one go.
// This will be addressed in the next step by modifying handleFileSelect.
