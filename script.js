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
  const BAR_COLOR = "green";
  const LINE_COLOR = "black";
  const TEXT_COLOR = "black";
  const FONT = "14px Arial";

  // Main drawing function
  function drawTimeline(tasks) {
    console.log('drawTimeline called with', tasks.length, 'tasks.');
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Year Labels and Vertical Grid Lines
    ctx.fillStyle = TEXT_COLOR;
    ctx.font = FONT;
    ctx.textAlign = "center"; // Center year labels

    for (let year = START_YEAR; year <= END_YEAR; year++) {
      const x = PADDING + TASK_LABEL_WIDTH + (year - START_YEAR) * YEAR_COLUMN_WIDTH;
      // Draw year text centered above the column
      ctx.fillText(year.toString(), x + YEAR_COLUMN_WIDTH / 2, PADDING + HEADER_HEIGHT / 2);

      // Draw vertical grid lines for each year column (middle of the column)
      if (year < END_YEAR) { // No need for a line after the last year's column
        ctx.strokeStyle = LINE_COLOR;
        ctx.beginPath();
        // Line starts from bottom of header, to bottom of canvas drawing area
        ctx.moveTo(x + YEAR_COLUMN_WIDTH, PADDING + HEADER_HEIGHT);
        ctx.lineTo(x + YEAR_COLUMN_WIDTH, CANVAS_HEIGHT - PADDING);
        ctx.stroke();
      }
    }
     ctx.textAlign = "left"; // Reset textAlign

    // Draw Task Names and Horizontal Lines
    tasks.forEach((task, i) => {
      const yText = PADDING + HEADER_HEIGHT + i * ROW_HEIGHT + ROW_HEIGHT / 2 + 5; // +5 for better vertical centering of text
      const yLine = PADDING + HEADER_HEIGHT + (i + 1) * ROW_HEIGHT; // Line at the bottom of the row

      // Draw the task name
      ctx.fillStyle = TEXT_COLOR;
      ctx.font = FONT;
      ctx.textAlign = "right";
      ctx.fillText(task["task name"], PADDING + TASK_LABEL_WIDTH - 10, yText);
      ctx.textAlign = "left"; // Reset for other text

      // Draw the horizontal line for the task row (separating tasks)
      ctx.strokeStyle = LINE_COLOR;
      ctx.beginPath();
      ctx.moveTo(PADDING + TASK_LABEL_WIDTH, yLine);
      ctx.lineTo(CANVAS_WIDTH - PADDING, yLine);
      ctx.stroke();

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

        const barY = PADDING + HEADER_HEIGHT + i * ROW_HEIGHT + ROW_HEIGHT * 0.25; // Position bar in the middle of the row
        const barHeight = ROW_HEIGHT * 0.5; // Bar is half the row height

        ctx.fillStyle = BAR_COLOR;
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
});

console.log("script.js loaded, DOMContentLoaded listener added, and file input handler set up.");
