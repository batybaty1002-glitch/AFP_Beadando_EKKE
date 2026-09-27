using Microsoft.AspNetCore.Mvc;
using AFP_Beadandó_EKKE.Models;

namespace AFP_Beadandó_EKKE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TasksController : ControllerBase
    {
        // Egyelőre egy sima statikus lista tárolja az adatokat a memóriában, 
        // amíg nem kötünk be adatbázist.
        private static readonly List<TaskItem> Tasks = new()
        {
            new TaskItem { Id = 1, Title = "Első feladat", Description = "Backend megírása", Status = "ongoing" },
            new TaskItem { Id = 2, Title = "Második feladat", Description = "Frontend összekötése", Status = "planned" }
        };

        // 1. GET: api/tasks (Összes lekérése)
        [HttpGet]
        public ActionResult<IEnumerable<TaskItem>> GetTasks()
        {
            return Ok(Tasks);
        }

        // 2. POST: api/tasks (Új feladat létrehozása)
        [HttpPost]
        public ActionResult<TaskItem> CreateTask([FromBody] TaskItem newTask)
        {
            newTask.Id = Tasks.Count > 0 ? Tasks.Max(t => t.Id) + 1 : 1;
            Tasks.Add(newTask);
            return CreatedAtAction(nameof(GetTasks), new { id = newTask.Id }, newTask);
        }

        // 3. PUT: api/tasks/{id} (Módosítás / pl. áthúzás másik oszlopba)
        [HttpPut("{id}")]
        public IActionResult UpdateTask(int id, [FromBody] TaskItem updatedTask)
        {
            var task = Tasks.FirstOrDefault(t => t.Id == id);
            if (task == null) return NotFound();

            task.Title = updatedTask.Title;
            task.Description = updatedTask.Description;
            task.Status = updatedTask.Status; // Itt változik meg pl., ha átkerül 'done'-ba

            return NoContent();
        }

        // 4. DELETE: api/tasks/{id} (Törlés)
        [HttpDelete("{id}")]
        public IActionResult DeleteTask(int id)
        {
            var task = Tasks.FirstOrDefault(t => t.Id == id);
            if (task == null) return NotFound();

            Tasks.Remove(task);
            return NoContent();
        }
    }
}