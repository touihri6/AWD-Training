const meetingService = require('../services/meeting.service');
const candidateService = require('../services/candidate.service');

const hello = (req, res) => {
  res.status(200).json({ message: "hello I'm microservice meeting" });
};

const findCandidate = async (req, res) => {
  const { status, body } = await candidateService.findById(req.params.id);
  res.status(status).json(body);
};

const findAll = (req, res) => {
  res.status(200).json(meetingService.findAll(req.query));
};

const findById = (req, res) => {
  res.status(200).json(meetingService.findById(req.params.id));
};

const create = async (req, res) => {
  res.status(201).json(await meetingService.create(req.body));
};

const update = async (req, res) => {
  res.status(200).json(await meetingService.update(req.params.id, req.body));
};

const remove = (req, res) => {
  meetingService.remove(req.params.id);
  res.status(204).end();
};

module.exports = {
  hello,
  findCandidate,
  findAll,
  findById,
  create,
  update,
  remove,
};
