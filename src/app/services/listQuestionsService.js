const { Op } = require("sequelize");
const sequelize = require("../../database/connection");
const { resolve } = require("path");
const {
  ListQuestions,
  Question,
  Class,
  Submission,
  User,
  ClassHasListQuestion,
} = sequelize.import(resolve(__dirname, "..", "models"));

class ListQuestionsService {
  async getListFromClassWithQuestionsAndUserInfos(idList, idClass, idUser) {
    try {
      const listPromise = ListQuestions.findOne({
        where: {
          id: idList,
        },
        attributes: ["id", "title"],
        order: [["questions", "createdAt"]],
        include: [
          {
            model: Question,
            as: "questions",
            attributes: [
              "id",
              "title",
              "type",
              "description",
              "katexDescription",
            ],
          },
        ],
      });
      const classHasListQuestionPromise = ClassHasListQuestion.findOne({
        where: {
          list_id: idList,
          class_id: idClass,
        },
        attributes: ["createdAt", "submissionDeadline"],
      });
      let [list, classHasListQuestion, user] = await Promise.all([
        listPromise,
        classHasListQuestionPromise,
      ]);

      let submissionDeadline = classHasListQuestion.submissionDeadline;
      submissionDeadline = submissionDeadline
        ? new Date(submissionDeadline)
        : null;
      let questions = await Promise.all(
        list.questions.map(async (question) => {
          const query = {
            where: {
              user_id: idUser,
              question_id: question.id,
              listQuestions_id: list.id,
              class_id: idClass,
            },
          };
          const submissionsCount = await Submission.count(query);
          query.where.hitPercentage = 100;
          const correctSumissionsCount = await Submission.count(query);
          if (submissionDeadline) {
            query.where.createdAt = {
              [Op.lte]: submissionDeadline,
            };
          }
          const completedSumissionsCount = await Submission.count(query);

          const questionCopy = JSON.parse(JSON.stringify(question));
          delete questionCopy.listHasQuestion;
          questionCopy.completedSumissionsCount = completedSumissionsCount;
          questionCopy.submissionsCount = submissionsCount;
          questionCopy.isCorrect = correctSumissionsCount > 0;
          return questionCopy;
        })
      );
      list = JSON.parse(JSON.stringify(list));

      list.questionsCount = questions.length;
      list.questionsCompletedSumissionsCount = questions.filter(
        (q) => q.completedSumissionsCount > 0
      ).length;
      questions.forEach((q) => delete q.completedSumissionsCount);
      list.questions = questions;
      list.classHasListQuestion = classHasListQuestion;
      return list;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async getListsFromClassWithUserSubmissions(idClass, idUser) {
    const listsQuery = {
      attributes: ["id", "title"],
      include: [
        {
          model: Question,
          as: "questions",
          attributes: ["id"],
        },
        {
          model: Class,
          as: "classes",
          attributes: ["id"],
          where: {
            id: idClass,
          },
        },
      ],
    };
    let lists = await ListQuestions.findAll(listsQuery);

    const submissionsQuery = {
      attributes: [
        "id",
        "question_id",
        "class_id",
        "hitPercentage",
        "createdAt",
      ],
      where: {
        user_id: idUser,
        class_id: idClass,
      },
    };
    const submissions = await Submission.findAll(submissionsQuery);

    lists = lists.map((list) => {
      let { createdAt, submissionDeadline } =
        list.classes[0].classHasListQuestion;
      const classHasListQuestion = { createdAt, submissionDeadline };

      submissionDeadline = submissionDeadline
        ? new Date(submissionDeadline)
        : null;

      const questions = list.questions.map((question) => {
        const questionSubmissions = submissions.filter(
          (submission) =>
            submission.question_id == question.id &&
            submission.class_id == idClass
        );
        const completedQuestionSubmissions = questionSubmissions.filter(
          (submission) =>
            submission.hitPercentage == 100 &&
            (submissionDeadline
              ? submission.createdAt < submissionDeadline
              : true)
        );

        const submissionsCount = questionSubmissions.length;
        const completedSumissionsCount = completedQuestionSubmissions.length;

        const questionCopy = JSON.parse(JSON.stringify(question));

        delete questionCopy.listHasQuestion;
        delete questionCopy.id;

        questionCopy.submissions = questionSubmissions;
        questionCopy.submissionsCount = submissionsCount;
        questionCopy.completedSumissionsCount = completedSumissionsCount;

        return questionCopy;
      });

      const listCopy = JSON.parse(JSON.stringify(list));

      delete listCopy.classes;
      delete listCopy.questions;

      listCopy.questionsCount = questions.length;
      listCopy.questionsCompletedSumissionsCount = questions.filter(
        (q) => q.completedSumissionsCount > 0
      ).length;
      listCopy.classHasListQuestion = classHasListQuestion;

      return listCopy;
    });

    lists = lists.sort((l1, l2) => {
      const date1 = l1.classHasListQuestion.createdAt;
      const date2 = l2.classHasListQuestion.createdAt;

      return date1 > date2 ? 1 : -1;
    });

    return lists;
  }
}
module.exports = new ListQuestionsService();
