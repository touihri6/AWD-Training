/**
 * ============================================================================
 *  controllers/meetingController.js — Contrôleur HTTP pour Meeting
 * ============================================================================
 */

'use strict';

const meetingService = require('../services/meetingService');

async function getAllMeetings(req, res, next) {
  try {
    const result = await meetingService.getAllMeetings({
      page:   req.query.page,
      limit:  req.query.limit,
      status: req.query.status
    });
    res.status(200).json(result);
  } catch (err) { next(err); }
}

async function getMeetingById(req, res, next) {
  try {
    const meeting = await meetingService.getMeetingById(Number(req.params.id));
    res.status(200).json(meeting);
  } catch (err) { next(err); }
}

async function createMeeting(req, res, next) {
  try {
    const meeting = await meetingService.createMeeting(req.body);
    res.status(201)
       .location(`/api/meetings/${meeting.id}`)
       .json(meeting);
  } catch (err) { next(err); }
}

async function updateMeeting(req, res, next) {
  try {
    const meeting = await meetingService.updateMeeting(Number(req.params.id), req.body);
    res.status(200).json(meeting);
  } catch (err) { next(err); }
}

async function updateMeetingStatus(req, res, next) {
  try {
    const meeting = await meetingService.updateMeetingStatus(Number(req.params.id), req.body.status);
    res.status(200).json(meeting);
  } catch (err) { next(err); }
}

async function deleteMeeting(req, res, next) {
  try {
    await meetingService.deleteMeeting(Number(req.params.id));
    res.status(204).send();
  } catch (err) { next(err); }
}

module.exports = {
  getAllMeetings,
  getMeetingById,
  createMeeting,
  updateMeeting,
  updateMeetingStatus,
  deleteMeeting
};
