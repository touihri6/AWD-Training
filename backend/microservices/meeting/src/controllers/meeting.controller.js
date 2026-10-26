/**
 * Meeting controller.
 *
 * Only `hello` is implemented. The meeting logic is a TODO for students (see TODO.md).
 */
const { meetingService } = require('../services/meeting.service');

const hello = (req, res) => {
  res.status(200).json({ message: "hello I'm microservice meeting" });
};

const findAll = (req, res) => {
  res.status(200).json(meetingService.findAll());
};

const findById = (req, res) => {
  const id = Number(req.params.id);
  const meeting = Number.isInteger(id) ? meetingService.findById(id) : null;
  if (meeting === null) {
    return res.status(404).json({ status: 404, error: 'Not Found', message: `Meeting ${req.params.id} not found` });
  }
  return res.status(200).json(meeting);
};

// TODO (students): implement the Meeting logic.
// No database: keep meetings in memory, for example:
//
// let meetings = [];
// let nextId = 1;
//
// const findAll = (req, res) => { ... };
// const findById = (req, res) => { ... };   // 404 if not found
// const create = (req, res) => { ... };     // 400 if invalid, 201 + created meeting
// const update = (req, res) => { ... };     // 404 / 400 / 200
// const remove = (req, res) => { ... };     // 404 / 204

module.exports = {
  hello,
  findAll,
  findById,
  // TODO (students): export findAll, findById, create, update, remove
};
